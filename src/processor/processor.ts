import { Dictionary } from 'dictionaryjs';
import { v4 as uuidv4 } from 'uuid';
import { Config } from '../config';
import { Command } from '../models/command';
import { Message } from '../models/message';
import { IProcessor } from '../interfaces/iprocessor';
import { ILogger } from '../interfaces/ilogger';
import { Utils } from '../infrastructure/utils';
import { RemoteCommandLoader } from '../infrastructure/remoteCommandLoader';
import { CommandFunctionWrapper } from '../infrastructure/commandFunctionWrapper';
import _ from 'lodash';
const path = require('path');
const fs = require('fs');
const urlJoin = require('url-join');    ``
const { Consumer } = require('rabbitmq-provider/consumer'); //TEMP

export class Processor implements IProcessor {
    private static readonly commandTemplateChar = '*';
    private static readonly defaultMessage = new Message();

    private readonly commandFunctionWrappers = new Dictionary<string, CommandFunctionWrapper>();
    private readonly resources = new Dictionary<string, any>();
    private readonly commandNames = new Dictionary<string, string>();
    private readonly commandsSource: string;
    private readonly isWebCommandsSource: boolean;
    private readonly processorBootstrapCommandName: string;

    private logger: ILogger;
    private remoteCodeLoader: RemoteCommandLoader;

    constructor(commandSetNum: number = 0) {
        Config.createConfig();

        this.id = `processor-${uuidv4()}`;
        this.workingDir = path.join(__dirname, '..');
        this.stdImportDir = path.join(__dirname, '../../node_modules');
        let commandSet = Config.commandSets[commandSetNum];
        this. processorBootstrapCommandName = commandSet.bootstrapCommandName;
        this.isWebCommandsSource = Utils.isWeb(commandSet.repoUrl);
        this.commandsSource = this.isWebCommandsSource
                ? urlJoin(commandSet.repoUrl, commandSet.dir)
                : path.join(this.workingDir, commandSet.dir);
        this.createCommandFileLookup();
    }

    async init(): Promise<Processor> {
        this.logger = (await import(path.join(this.workingDir, Config.logger.filePath))).create();
        this.logger.log(`Processor ${this.id} started`);

        //TEMP
        if (this.isWebCommandsSource)
            this.remoteCodeLoader = new RemoteCommandLoader(this.commandsSource, this.logger);

        this.logger.log(`${this.isWebCommandsSource ? 'Web' : 'Local'} command repository is used`);
        this.logger.log(`Processor \"${this.id}\" initialized and runs its bootstrap command \"${this.processorBootstrapCommandName}\"`);

        let msgPrefix = `Bootstrap command \"${this.processorBootstrapCommandName}\"`;
        if (await this.execute(new Command(this.processorBootstrapCommandName)))
            this.logger.log(`${msgPrefix} successfully executed`);
        else
            this.logger.log(`Error: ${msgPrefix} has failed`);

        return this;
    }


    // Implementation of IProcessor

    // Get general info / resources from processor

    public readonly id: string;
    public readonly workingDir: string;
    public readonly stdImportDir: string;
    public readonly parallelCmdName = '';

    getLogger = (): ILogger => this.logger;

    // Resources

    getResource(resourceName: string): any {
        try {
            return this.resources.get(resourceName);
        }
        catch (err) {
            this.logger.log(`resource \"resourceName\" is not available`);
            return undefined;
        }
    }

    setResource = (resourceName: string, resource: any): void => this.resources.set(resourceName, resource);

    deleteResource(resourceName: string): void {
        if (this.getResource(resourceName))
            this.resources.remove(resourceName);
    }

    // Public execute commands methods

    async execute(...orgCommands: Array<Command>): Promise<boolean> {
        let br = true;
        let commands = this.isWebCommandsSource
                            ? orgCommands
                            : this.processPossibleCommandTemplate(orgCommands);
        for (let i = 0; i < commands.length; i++)
            br = br && await (this.executeOne(commands[i]));

        return br;
    }

    executeParallel = async (...commands: Array<Command>): Promise<boolean> =>
        await this.executeManyInParallel(this.processPossibleCommandTemplate(commands));

    executeFork = (delayInMs: number, ...commands: Array<Command>) =>
        setTimeout(async () => await this.execute(...commands), delayInMs);

    executeForkParallel = (delayInMs: number, ...commands: Array<Command>) =>
        setTimeout(async () => await this.executeParallel(...commands), delayInMs);

    async getCommandFromQueueMessageAndExecute(item: any): Promise<void> {
        let _ = item.fields;
        const jsonPayloads = Consumer.getPayloads(item);
        for (let i = 0; i < jsonPayloads.length; i++) {
            try {
                let command: Command = jsonPayloads[i];
                if (command.name === this.parallelCmdName)
                    await this.executeManyInParallel(command.args, item.fields);
                else
                    await this.executeOne(command, item.fields);
            }
            catch (err) {
                this.logger.log(err);
            }
        }
    }

    // Private methods

    private async executeOne(command: Command, message: Message = Processor.defaultMessage): Promise<boolean> {
        let br = false;
        try {
            let cmdFunc: CommandFunctionWrapper = this.commandFunctionWrappers.get(command.name);
            if (!cmdFunc) {
                let fnCommand;

                if (!Utils.isNotEmptyString(command.name))
                    return false;

                if (this.isWebCommandsSource)
                    // Remote commands
                    fnCommand = await this.remoteCodeLoader.importCommand2(`${command.name}-1.js`); //TEMP
                else {
                    // Local commands
                    let actualCommandFileName = this.commandNames.get(command.name);
                    if (actualCommandFileName)
                        fnCommand = (await import(actualCommandFileName)).command;
                }

                if (fnCommand) {
                    cmdFunc = new CommandFunctionWrapper(fnCommand, this.logger);
                    this.commandFunctionWrappers.set(command.name, cmdFunc);
                }
            }

            if (cmdFunc)
                br = await cmdFunc.call(command.args, this as IProcessor, message);
            else
                await this.logger.log(`Error: execution of command \"${command.name}\" has failed`);
        }
        catch (err) {
            await this.logger.log(err);
        }

        return br;
    }

    private async executeManyInParallel(commands: Array<Command>, message: Message = Processor.defaultMessage)
            : Promise<boolean> {
        let br = true;
        let promises = new Array<Promise<boolean>>();
        for (let i = 0; i < commands.length; i++)
            promises.push(this.executeOne(commands[i], message));

        for (let i = 0; i < promises.length; i++)
            br = br && await promises[i];

        return br;
    }

    private createCommandFileLookup = () => {
        if (!this.isWebCommandsSource)
            fs.readdirSync(this.commandsSource).forEach((fileName: string) => {
                let _ = Processor.parseFileName(fileName);
                if (Processor.checkOnVersion(_))
                    this.commandNames.set(_.name, path.join(this.commandsSource, fileName));
            });
    }

    private processPossibleCommandTemplate(orgCommands: Array<Command>): Array<Command> {
        let commands = orgCommands;
        if (!this.isWebCommandsSource) {  //TEMP
            let commands = new Array<Command>();
            for (let i = 0; i < orgCommands.length; i++) {
                let command = orgCommands[i];
                let asteriskIndex = command.name.indexOf(Processor.commandTemplateChar);
                if (asteriskIndex > -1) {
                    let prefix = command.name.substr(0, asteriskIndex);
                    let commandNames = this.commandNames.getKeys();
                    for (let  j = 0; j < commandNames.length; j++) {
                        let commandName = commandNames[j] as string;
                        if (commandName.includes(prefix, 0))
                            commands.push(new Command(commandName, command.args));
                    }
                }
                else
                    commands.push(command);
            }
        }

        return commands;
    }

    private static parseFileName(fileName: string): any {
        let ss0 = fileName.split('-');
        let name = ss0[0];
        let ss1 = ss0[1].split('.');
        let version = parseInt(ss1[0]);
        let ext = ss1[1];
        let extMap = ss1.length > 2 ? ss1[2] : '';
        return { name, version, ext, extMap };
    }

    private static checkOnVersion = (obj: any): boolean =>
        Config.versions.min <= obj.version && obj.version <= Config.versions.max
        && obj.ext.toLowerCase() === 'js' && obj.extMap === '';
}

