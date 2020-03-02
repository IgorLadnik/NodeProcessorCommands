import { IProcessor } from './iprocessor';
import { ILogger } from '../infrastructure/ilogger';
import { Dictionary } from 'dictionaryjs';
import { Publisher, Consumer } from '../infrastructure/rabbitmqProvider';
import { CommandInfo } from '../models/commandinfo';
import { ItemInfo } from '../models/iteminfo';

export class Processor implements IProcessor {
    static commandsDir = '../commands/';
    static parallelCmdName = '_cmdParallel';

    commands = new Dictionary<string, any>();
    queueNames: Array<string>;
    publishers = new Dictionary<string, Publisher>();
    resources = new Dictionary<string, any>();
    l: any;

    constructor(...queueNames: Array<string>) {
        this.queueNames = queueNames;
    }

    async init(): Promise<Processor> {
        await this.getAndExecuteCommand(new CommandInfo('cmdInitial'), undefined);
        this.l = this.resources.get('logger') as ILogger;
        await Promise.all([this.startConsumers(), this.createPublishers()]);
        return this;
    }

    getQueueNames(): Array<string> {
        return this.queueNames;
    }

    getResource(resourceName: string): any {
        try {
            return this.resources.get(resourceName);
        }
        catch (err) {
            console.log(`resource \"resourceName\" is not available`);
            return undefined;
        }
    }

    addResource(resourceName: string, resource: any): void {
        this.resources.set(resourceName, resource);
    }

    async createPublishers() {
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i], await Publisher.start(this.queueNames[i], this.l, true));
    }

    async startConsumers() {      
        let promises = new Array<Promise<Consumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(Consumer.start(this.queueNames[i], this.l,async (item: any) =>
                await this.getCommandFromQueueItemAndExecute(item)));
                    
        await Promise.all(promises);
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

    async getCommandFromQueueItemAndExecute(item: any): Promise<void> {
        let _ = item.fields;
        try {
            let itemInfo = new ItemInfo(_.exchange, _.routingKey, _.consumerTag, _.deliveryTag, _.redelivered);
            let commandInfo: CommandInfo = JSON.parse(item.content.toString());
            if (commandInfo.name === Processor.parallelCmdName)
                await this.executeParallel(commandInfo.args);
            else
                await this.getAndExecuteCommand(commandInfo, itemInfo);
        }
        catch (err) {
            console.log(err);
        }
    }

    async executeParallel(args: any): Promise<void> {
        let commandInfos: Array<CommandInfo> = args;
        let promises: Array<Promise<any>> = [];
        if (!commandInfos)
            return;

        try {
            for (let i = 0; i < commandInfos.length; i++)
                promises.push(this.getAndExecuteCommand(commandInfos[i], undefined));

            await Promise.all(promises);
        }
        catch (err) {
            console.log(err);
        }
    }

    async getAndExecuteCommand(commandInfo: CommandInfo, itemInfo: any): Promise<void> {
        try {
            let command: any = this.commands.get(commandInfo.name);
            if (!command) {
                command = await import(`${Processor.commandsDir}${commandInfo.name}`);
                this.commands.set(commandInfo.name, command);
            }

            await command.executeCommand(commandInfo.args, this as IProcessor, itemInfo);
        }
        catch (err) {
            console.log(err);
        }
    }
}

