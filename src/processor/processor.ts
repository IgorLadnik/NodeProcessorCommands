import { IProcessor } from '../interfaces/iprocessor';
import { ILogger } from '../interfaces/ilogger';
import { Dictionary } from 'dictionaryjs';
import { Command } from '../models/command';
import { Message } from '../models/message';
import { Config } from '../config';
import { IMessageBrokerFactory, IPublisher, IConsumer } from '../interfaces/messageInterfaces';
import { v4 as uuidv4 } from 'uuid';
import { Utils } from '../infrastructure/utils';
const path = require('path');
const fs = require('fs');

export class Processor implements IProcessor {
    private static readonly commandTemplateChar = '*';
    private static readonly defaultMessage = new Message();

    private readonly id: string;
    private readonly parallelCmdName = '';
    private readonly commandsDir: string;
    private readonly commands = new Dictionary<string, any>();
    private readonly publishers = new Dictionary<string, IPublisher>();
    private readonly resources = new Dictionary<string, any>();
    private readonly commandNames = new Dictionary<string, string>();
    private readonly workingDir: string;

    private readonly processorBootstrapCommandName: string;
    private queueNames = new Array<string>();
    private logger: ILogger;
    private messageBrokerFactory: IMessageBrokerFactory;
    private isPubCons = false;

    constructor(commandSetNum: number = 0) {
        this.id = `processor-${uuidv4()}`;
        this.workingDir = path.join(__dirname, '..');
        this. processorBootstrapCommandName = Config.commandSets[commandSetNum].bootstrapCommandName;
        this.commandsDir = path.join(this.workingDir, Config.commandSets[commandSetNum].dir);
        this.createCommandFileLookup();
        this.isPubCons = Utils.isValid(Config.messageBroker) &&
                         Utils.isNotEmptyString(Config.messageBroker.factoryFilePath) &&
                         Utils.isValid(Config.messageBroker.queueNames) &&
                         Config.messageBroker.queueNames.length > 0;
    }

    async init(): Promise<Processor> {
        this.logger = (await import(path.join(this.workingDir, Config.logger.filePath))).create();
        this.logger.log(`Processor ${this.id} started`);
        if (this.isPubCons) {
            try {
                this.messageBrokerFactory = (await import(path.join(this.workingDir, Config.messageBroker.factoryFilePath))).create();
                this.queueNames = Config.messageBroker.queueNames;
                await Promise.all([this.startConsumers(), this.createPublishers()]);
                this.isPubCons = true;
            } catch (err) {
            }
        }

        this.logger.log(`Message broker is ${this.isPubCons ? '' : 'NOT '}supported`);
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

    getId = (): string => this.id;

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
        let commands = this.processPossibleCommandTemplate(orgCommands);
        for (let i = 0; i < commands.length; i++)
            br = br && await (this.executeOne(commands[i]));

        return br;
    }

    executeParallel = async (...commands: Array<Command>): Promise<boolean> =>
        await this.executeManyInParallel(this.processPossibleCommandTemplate(commands));


    // Publish methods

    isMessageBrokerSupported = (): boolean => this.isPubCons;

    getQueueNames = (): Array<string> => this.queueNames;

    async publish(queueName: string, ...commands: Array<Command>): Promise<void> {
        if (!this.messageBrokerFactory)
            return;
        await this.publishers.get(queueName).publish<Command>(queueName,
                        this.processPossibleCommandTemplate(commands), true);
    }

    async publishParallel(queueName: string, ...commands: Array<Command>): Promise<void> {
        if (!this.messageBrokerFactory)
            return;
        await this.publishOne(queueName, new Command(this.parallelCmdName,
                        this.processPossibleCommandTemplate(commands)), true);
    }

    // Private methods

    private async executeOne(command: Command, message: Message = Processor.defaultMessage): Promise<boolean> {
        let br = false;
        try {
            let cmd: any = this.commands.get(command.name);
            if (!cmd) {
                let actualCommandFileName = this.commandNames.get(command.name);
                if (actualCommandFileName) {
                    cmd = await import(actualCommandFileName);
                    this.commands.set(command.name, cmd);
                }
                else
                    this.logger.log(`Error: file for command \"${command.name}\" does not exists`);
            }

            if (cmd)
                br = await cmd.command(command.args, this as IProcessor, message);
        }
        catch (err) {
            this.logger.log(err);
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

    private async createPublishers(): Promise<void> {
        if (!this.messageBrokerFactory)
            return;
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i],
                await this.messageBrokerFactory.startPublisher(this.queueNames[i], this.logger, true));
    }

    private async startConsumers(): Promise<void> {
        if (!this.messageBrokerFactory)
            return;
        let promises = new Array<Promise<IConsumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(this.messageBrokerFactory.startConsumer(this.queueNames[i], this.logger,
                async (item: any) => await this.getCommandFromQueueMessageAndExecute(item)));
                    
        await Promise.all(promises);
    }

    private publishOne = async (queueName: string, command: Command, persistent: boolean): Promise<void> =>
        await this.publishers.get(queueName).publishOne<Command>(queueName, command, persistent);

    private async getCommandFromQueueMessageAndExecute(item: any): Promise<void> {
        let _ = item.fields;
        try {
            let message = new Message(_.exchange, _.routingKey, _.consumerTag, _.deliveryTag, _.redelivered);
            let command: Command = JSON.parse(`${item.content}`);
            if (command.name === this.parallelCmdName)
                await this.executeManyInParallel(command.args, message);
            else
                await this.executeOne(command, message);
        }
        catch (err) {
            this.logger.log(err);
        }
    }

    private createCommandFileLookup = () =>
        fs.readdirSync(this.commandsDir).forEach((fileName: string) => {
            let _ = Processor.parseFileName(fileName);
            if (Processor.checkOnVersion(_))
                this.commandNames.set(_.name, path.join(this.commandsDir, fileName));
        });

    private processPossibleCommandTemplate(orgCommands: Array<Command>): Array<Command> {
        let ret = orgCommands;
        let commands = new Array<Command>();
        for (let  i = 0; i < orgCommands.length; i++) {
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

    private static checkOnVersion = (_: any): boolean =>
        Config.versions.min <= _.version && _.version <= Config.versions.max
        && _.ext.toLowerCase() === 'js' && _.extMap === '';
}

