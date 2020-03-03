import { IProcessor } from '../interfaces/iprocessor';
import { ILogger } from '../interfaces/ilogger';
import { Dictionary } from 'dictionaryjs';
import { CommandInfo } from '../models/commandinfo';
import { MessageInfo } from '../models/messageInfo';
import { Config } from '../config';
import { IMessageBrokerFactory, IPublisher, IConsumer } from '../interfaces/messageInterfaces';
const fs = require('fs');

export class Processor implements IProcessor {
    private commandsDir: string;
    private processorBootstrapCommandName = Config.processorBootstrapCommandName;
    private parallelCmdName = '';

    private readonly commands = new Dictionary<string, any>();
    private readonly queueNames: Array<string>;
    private readonly publishers = new Dictionary<string, IPublisher>();
    private readonly resources = new Dictionary<string, any>();
    private l: any;
    private messageBrokerFactory: any;
    private readonly commandNames = new Dictionary<string, string>();

    constructor(workingDir: string, ...queueNames: Array<string>) {
        this.commandsDir = `${workingDir}/${Config.commandsDir}/`;
        this.queueNames = queueNames;
        this.createCommandFileLookup();
    }

    async init(): Promise<Processor> {
        await this.getAndExecuteCommand(new CommandInfo(this.processorBootstrapCommandName), new MessageInfo());
        this.l = this.resources.get('logger') as ILogger;
        await Promise.all([this.startConsumers(), this.createPublishers()]);
        return this;
    }


    // Implementation of IProcessor

    createMessageBrokerFactory(messageBrokerFactory: IMessageBrokerFactory): void {
        this.messageBrokerFactory = messageBrokerFactory;
    }

    getQueueNames(): Array<string> {
        return this.queueNames;
    }

    getResource(resourceName: string): any {
        try {
            return this.resources.get(resourceName);
        }
        catch (err) {
            this.l.log(`resource \"resourceName\" is not available`);
            return undefined;
        }
    }

    setResource(resourceName: string, resource: any): void {
        if (resource !== undefined)
            this.resources.set(resourceName, resource);
        else
            this.resources.remove(resourceName);
    }

    async publish(queueName: string, commandInfo: CommandInfo, persistent: boolean)
        : Promise<void> {
        await this.publishers.get(queueName).publish<CommandInfo>(queueName, commandInfo, persistent);
    }

    async publishMany(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean)
        : Promise<void> {
        await this.publishers.get(queueName).publishMany<CommandInfo>(queueName, arrCommandInfo, persistent);
    }

    async publishParallel(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean)
        : Promise<void> {
        await this.publish(queueName, new CommandInfo(this.parallelCmdName, arrCommandInfo), persistent);
    }

    async getAndExecuteCommand(commandInfo: CommandInfo, messageInfo: MessageInfo): Promise<void> {
        try {
            let command: any = this.commands.get(commandInfo.name);
            if (!command) {
                let actualCommandFileName = this.commandNames.get(commandInfo.name);
                if (actualCommandFileName) {
                    command = await import(actualCommandFileName);
                    this.commands.set(commandInfo.name, command);
                }
                else
                    this.l.log(`Error: file for command \"${commandInfo.name}\" does not exists`);
            }

            if (command)
                await command.executeCommand(commandInfo.args, this as IProcessor, messageInfo);
        }
        catch (err) {
            this.l.log(err);
        }
    }


    // Private methods

    private async createPublishers(): Promise<void> {
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i],
                await this.messageBrokerFactory.startPublisher(this.queueNames[i], this.l, true));
    }

    private async startConsumers(): Promise<void> {
        let promises = new Array<Promise<IConsumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(this.messageBrokerFactory.startConsumer(this.queueNames[i], this.l,
                async (item: any) => await this.getCommandFromQueueItemAndExecute(item)));
                    
        await Promise.all(promises);
    }

    private async getCommandFromQueueItemAndExecute(item: any): Promise<void> {
        let _ = item.fields;
        try {
            let messageInfo = new MessageInfo(_.exchange, _.routingKey, _.consumerTag, _.deliveryTag, _.redelivered);
            let commandInfo: CommandInfo = JSON.parse(item.content.toString());
            if (commandInfo.name === this.parallelCmdName)
                await this.executeParallel(commandInfo.args);
            else
                await this.getAndExecuteCommand(commandInfo, messageInfo);
        }
        catch (err) {
            this.l.log(err);
        }
    }

    private async executeParallel(args: any): Promise<void> {
        let commandInfos: Array<CommandInfo> = args;
        let promises: Array<Promise<any>> = [];
        if (!commandInfos)
            return;

        try {
            for (let i = 0; i < commandInfos.length; i++)
                promises.push(this.getAndExecuteCommand(commandInfos[i], new MessageInfo()));

            await Promise.all(promises);
        }
        catch (err) {
            this.l.log(err);
        }
    }

    private createCommandFileLookup() {
        fs.readdirSync(this.commandsDir).forEach((fileName: string) => {
            let _ = Processor.parseFileName(fileName);
            if (Processor.checkOnVersion(_))
                this.commandNames.set(_.name, `${this.commandsDir}${fileName}`);
        });
    }

    private static parseFileName(fileName: string): any  {
        let ss0 = fileName.split('-');
        let name = ss0[0];
        let ss1 = ss0[1].split('.');
        let version = parseInt(ss1[0]);
        let ext = ss1[1];
        let extMap = ss1.length > 2 ? ss1[2] : '';
        return { name, version, ext, extMap };
    }

    private static checkOnVersion(_: any): boolean {
        return Config.versionMin <= _.version && _.version <= Config.versionMax
               && _.ext.toLowerCase() === 'js' && _.extMap === '';
    }
}

