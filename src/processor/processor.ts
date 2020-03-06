import { IProcessor } from '../interfaces/iprocessor';
import { ILogger } from '../interfaces/ilogger';
import { Dictionary } from 'dictionaryjs';
import { Command } from '../models/command';
import { Message } from '../models/message';
import { Config } from '../config';
import { IMessageBrokerFactory, IPublisher, IConsumer } from '../interfaces/messageInterfaces';
import { v4 as uuidv4 } from 'uuid';
const fs = require('fs');

export class Processor implements IProcessor {
    private static defaultMessage = new Message();

    private readonly id: string;
    private readonly parallelCmdName = '';
    private readonly commandsDir: string;
    private readonly commands = new Dictionary<string, any>();
    private readonly publishers = new Dictionary<string, IPublisher>();
    private readonly resources = new Dictionary<string, any>();
    private readonly commandNames = new Dictionary<string, string>();
    private readonly workingDir: string;
    private readonly retValName = '__retVal';

    private processorBootstrapCommandName = Config.processorBootstrapCommandName;
    private queueNames = new Array<string>();
    private logger: ILogger;
    private messageBrokerFactory: IMessageBrokerFactory;
    private isPubCons: boolean = false;

    constructor(workingDir: string) {
        this.id = `processor-${uuidv4()}`;
        this.workingDir = workingDir;
        this.commandsDir = `${this.workingDir}/${Config.commandsDir}/`;
        this.createCommandFileLookup();
    }

    async init(): Promise<Processor> {
        this.logger = (await import(`${this.workingDir}/${Config.loggerFilePath}`)).create();
        this.logger.log(`Processor ${this.id} started`);
        if (Config.messageBrokerFactoryFilePath && Config.queueNames && Config.queueNames.length > 0) {
            try {
                this.messageBrokerFactory = (await import(`${this.workingDir}/${Config.messageBrokerFactoryFilePath}`)).create();
                this.queueNames = Config.queueNames;
                await Promise.all([this.startConsumers(), this.createPublishers()]);
                this.isPubCons = true;
                this.logger.log('Publish / Consume is supported');
            } catch (err) {
                this.logger.log('Publish / Consume is NOT supported');
            }
        }
        else
            this.logger.log('Publish / Consume is NOT supported');

        this.logger.log(`Processor \"${this.id}\" initialized and runs its bootstrap command \"${this.processorBootstrapCommandName}\"`);

        await this.executeOne(new Command(this.processorBootstrapCommandName));
        return this;
    }


    // Implementation of IProcessor

    getId = (): string => this.id;

    getLogger = (): ILogger => this.logger;

    getQueueNames = (): Array<string> => this.queueNames;

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

    // Set return value

    setRetVal = (retVal: any): void => this.setResource(this.retValName, retVal);
    setRetValTrue = (): void => this.setResource(this.retValName, true);
    setRetValFalse = (): void => this.setResource(this.retValName, false);

    // Public execute commands methods

    async execute(...commands: Array<Command>): Promise<void> {
        for (let i = 0; i < commands.length; i++)
            await (this.executeOne(commands[i]));
    }

    async executeParallel(...commands: Array<Command>): Promise<void> {
        let promises = new Array<Promise<void>>();
        for (let i = 0; i < commands.length; i++)
            promises.push(this.executeOne(commands[i]));

        await Promise.all(promises);
    }

    // Publish methods

    isMessageBrokerSupported = (): boolean => this.isPubCons;

    async publish(queueName: string, ...commands: Array<Command>): Promise<void> {
        if (!this.messageBrokerFactory)
            return;
        await this.publishers.get(queueName).publish<Command>(queueName, commands, true);
    }

    async publishParallel(queueName: string, ...commands: Array<Command>): Promise<void> {
        if (!this.messageBrokerFactory)
            return;
        await this.publishOne(queueName, new Command(this.parallelCmdName, commands), true);
    }

    async executeRepetitive(command: Command, commandFailback: Command): Promise<boolean> {
        const resourceName = this.retValName;
        let cmdResult = false;
        for (let i = 0; i < 2; i++) {
            await this.execute(command);
            if ((cmdResult = this.getResource(resourceName)) === false) {
                await this.execute(commandFailback);
            }
            else
                break;
        }

        this.deleteResource(resourceName);
        return cmdResult;
    }

    // Private methods

    private async executeOne(command: Command, message: Message = Processor.defaultMessage): Promise<void> {
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
                await cmd.command(command.args, this as IProcessor, message);
        }
        catch (err) {
            this.logger.log(err);
        }
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
            let command: Command = JSON.parse(item.content.toString());
            if (command.name === this.parallelCmdName)
                await this.executeParallel(...command.args);
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
                this.commandNames.set(_.name, `${this.commandsDir}${fileName}`);
        });

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
        Config.versionMin <= _.version && _.version <= Config.versionMax
        && _.ext.toLowerCase() === 'js' && _.extMap === '';
}

