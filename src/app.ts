import { Publisher, Consumer } from './rabbitmq';
import { Dictionary } from 'dictionaryjs';
import { CommandInfo } from './commandInfo';
//import { SqlServerHelper } from './SqlServerHelper';

class Processor {
    static commandsDir = './commands/';
    static connUrl = 'amqp://localhost';
    static dctCommand = new Dictionary<string, any>();
    queueNames: Array<string>;
    publishers = new Dictionary<string, Publisher>();
    //sqlServerHelper = new SqlServerHelper(); 
    resorces: any;

    constructor(...queueNames: Array<string>) {
        this.queueNames = queueNames;
        this.resorces = { publishers: this.publishers };
    }

    async createPublishers() {
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i], await Publisher.start(Processor.connUrl, this.queueNames[i], true));
    }

    async startConsumers() {
        // await this.sqlServerHelper.connect();
        // this.resorces.sqlServerHelper = this.sqlServerHelper; 
        
        let promises = new Array<Promise<Consumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(Consumer.start(Processor.connUrl, this.queueNames[i], async (item: any) => 
                this.resorces = await Processor.getCommandFromQueueItemAndExcute(item, this.resorces)));
                    
        await Promise.all(promises);
    }

    static async getCommandFromQueueItemAndExcute(item: any, resources: any): Promise<any> {
        let updatedResources = resources;
        try {
            let itemInfo = {
                exchange: item.fields.exchange,
                queueName: item.fields.routingKey,
                consumerTag: item.fields.consumerTag,
                deliveryTag: item.fields.deliveryTag,
                redelivered: item.fields.redelivered
            };

            let commandInfo: CommandInfo = JSON.parse(item.content.toString());

            updatedResources = await Processor.getAndExecuteCommand(commandInfo, itemInfo, resources);

            // let command: any = Processor.dctCommand.get(commandInfo.name);
            // if (!command) {
            //     command = await import(`${Processor.commandsDir}${commandInfo.name}`);
            //     Processor.dctCommand.set(commandInfo.name, command);
            // }

            // updatedResources = await command.executeCommand(commandInfo.args, itemInfo, resources);
        }
        catch (err) {
            console.log(err);
        }

        return updatedResources;
    }

    static async getAndExecuteCommand(commandInfo: CommandInfo, itemInfo: any, resources: any): Promise<any> {
        let updatedResources = resources;
        try {
            let command: any = Processor.dctCommand.get(commandInfo.name);
            if (!command) {
                command = await import(`${Processor.commandsDir}${commandInfo.name}`);
                Processor.dctCommand.set(commandInfo.name, command);
            }

            updatedResources = await command.executeCommand(commandInfo.args, itemInfo, resources, Processor.getAndExecuteCommand);
        }
        catch (err) {
            console.log(err);
        }

        return updatedResources;
    }
}

(async function main() {
    const queueName: string = 'il-01';

    let processor = new Processor(queueName);
    await Promise.all([processor.startConsumers(), processor.createPublishers()]);

    setTimeout(() => 
        processor.publishers.get(queueName)
            .publish<CommandInfo>(queueName, new CommandInfo('cmdFirst', {a: 'aaa', n: 1})),
        1000);
})();  
