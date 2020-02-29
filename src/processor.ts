import { Publisher, Consumer } from './infrastructure/rabbitmqProvider';
import { Dictionary } from 'dictionaryjs';
import { CommandInfo } from './models/commandInfo';
import { ItemInfo } from './models/itemInfo';

export class Processor {
    static commandsDir = './commands/';
    static commands = new Dictionary<string, any>();
    queueNames: Array<string>;
    publishers = new Dictionary<string, Publisher>();
    resources: any;

    constructor(...queueNames: Array<string>) {
        this.queueNames = queueNames;
        this.resources = { publishers: this.publishers };
    }

    async createPublishers() {
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i], await Publisher.start(this.queueNames[i], true));
    }

    async startConsumers() {      
        let promises = new Array<Promise<Consumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(Consumer.start(this.queueNames[i], async (item: any) =>
                this.resources = await Processor.getCommandFromQueueItemAndExecute(this.resources, item)));
                    
        await Promise.all(promises);
    }

    static async getCommandFromQueueItemAndExecute(resources: any, item: any): Promise<any> {
        let updatedResources = resources;
        let _ = item.fields;
        try {
            let itemInfo = new ItemInfo(_.exchange, _.routingKey, _.consumerTag, _.deliveryTag, _.redelivered);
            let commandInfo: CommandInfo = JSON.parse(item.content.toString());
            updatedResources = await Processor.getAndExecuteCommand(commandInfo, resources, itemInfo);
        }
        catch (err) {
            console.log(err);
        }

        return updatedResources;
    }

    static async getAndExecuteCommand(commandInfo: CommandInfo, resources: any, itemInfo: any = undefined): Promise<any> {
        let updatedResources = resources;
        try {
            let command: any = Processor.commands.get(commandInfo.name);
            if (!command) {
                command = await import(`${Processor.commandsDir}${commandInfo.name}`);
                Processor.commands.set(commandInfo.name, command);
            }

            updatedResources = await command.executeCommand(commandInfo.args, resources, itemInfo, 
                                                Processor.getAndExecuteCommandAsCallback);
        }
        catch (err) {
            console.log(err);
        }

        return updatedResources;
    }

    static async getAndExecuteCommandAsCallback(commandInfo: CommandInfo, resources: any): Promise<any> {
        return Processor.getAndExecuteCommand(commandInfo, resources);
    }
}

