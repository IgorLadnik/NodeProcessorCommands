import { IProcessor } from './iprocessor';
import { ILogger } from '../interfaces/ilogger';
import { Dictionary } from 'dictionaryjs';
import { CommandInfo } from '../models/commandinfo';
import { MessageInfo } from '../models/messageInfo';
import { Config } from '../config';
import { IMessageBrokerFactory, IPublisher, IConsumer } from '../interfaces/messageInterfaces';

export class Processor implements IProcessor {
    private static commandsDir = Config.commandsDir;
    private static processorBootstrapCommandName = Config.processorBootstrapCommandName;
    private static parallelCmdName = '';

    private readonly commands = new Dictionary<string, any>();
    private readonly queueNames: Array<string>;
    private readonly publishers = new Dictionary<string, IPublisher>();
    private readonly resources = new Dictionary<string, any>();
    private l: any;
    private messageBrokerFactory: any;

    constructor(...queueNames: Array<string>) {
        this.queueNames = queueNames;
    }

    async init(): Promise<Processor> {
        await this.getAndExecuteCommand(new CommandInfo(Processor.processorBootstrapCommandName), new MessageInfo());
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

    addResource(resourceName: string, resource: any): void {
        this.resources.set(resourceName, resource);
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
        await this.publish(queueName, new CommandInfo(Processor.parallelCmdName, arrCommandInfo), persistent);
    }

    async getAndExecuteCommand(commandInfo: CommandInfo, messageInfo: MessageInfo): Promise<void> {
        try {
            let command: any = this.commands.get(commandInfo.name);
            if (!command) {
                command = await import(`${Processor.commandsDir}${commandInfo.name}`);
                this.commands.set(commandInfo.name, command);
            }

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
            if (commandInfo.name === Processor.parallelCmdName)
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
}

