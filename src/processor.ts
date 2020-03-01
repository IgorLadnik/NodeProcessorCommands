import { Publisher, Consumer } from './infrastructure/rabbitmqProvider';
import { Dictionary } from 'dictionaryjs';
import { CommandInfo } from './models/commandInfo';
import { ItemInfo } from './models/itemInfo';

export interface IProcessor {
    publish(queueName: string, commandInfo: CommandInfo, persistent: boolean): Promise<void>;
    publishMany(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean): Promise<void>;
    publishParallel(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean) : Promise<void>;
}

export class Processor implements IProcessor {
    static commandsDir = './commands/';
    static parallelCmdName = '_cmdParallel';

    static commands = new Dictionary<string, any>();
    queueNames: Array<string>;
    publishers = new Dictionary<string, Publisher>();
    resources: any;

    constructor(...queueNames: Array<string>) {
        this.queueNames = queueNames;
        //this.resources = { publishers: this.publishers };
        this.resources = { processor: this as IProcessor };
    }

    async createPublishers() {
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i], await Publisher.start(this.queueNames[i], true));
    }

    async startConsumers() {      
        let promises = new Array<Promise<Consumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(Consumer.start(this.queueNames[i], async (item: any) =>
                this.resources = await this.getCommandFromQueueItemAndExecute(item)));
                    
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

    async getCommandFromQueueItemAndExecute(item: any): Promise<any> {
        let updatedResources = this.resources;
        let _ = item.fields;
        try {
            let itemInfo = new ItemInfo(_.exchange, _.routingKey, _.consumerTag, _.deliveryTag, _.redelivered);
            let commandInfo: CommandInfo = JSON.parse(item.content.toString());
            if (commandInfo.name === Processor.parallelCmdName)
                await this.executeParallel(commandInfo.args);
            else
                updatedResources = await Processor.getAndExecuteCommand(commandInfo, this.resources, itemInfo);
        }
        catch (err) {
            console.log(err);
        }

        if (!updatedResources)
            updatedResources = this.resources;

        return updatedResources;
    }

    async executeParallel(args: any): Promise<void> {
        let commandInfos: Array<CommandInfo> = args;
        let promises: Array<Promise<any>> = [];
        if (!commandInfos)
            return;

        try {
            for (let i = 0; i < commandInfos.length; i++)
                promises.push(Processor.getAndExecuteCommand(commandInfos[i], this.resources));

            /*let arrUpdateedResources: Array<any> = */await Promise.all(promises);
        }
        catch (err) {
            console.log(err);
        }
    }

    static async getAndExecuteCommand(commandInfo: CommandInfo, resources: any, itemInfo: any = undefined)
        : Promise<any> {
        let updatedResources = resources;
        try {
            let command: any = Processor.commands.get(commandInfo.name);
            if (!command) {
                command = await import(`${Processor.commandsDir}${commandInfo.name}`);
                Processor.commands.set(commandInfo.name, command);
            }

            updatedResources =
                await command.executeCommand(commandInfo.args, resources, itemInfo, Processor.getAndExecuteCommand);
        }
        catch (err) {
            console.log(err);
        }

        return updatedResources;
    }
}

