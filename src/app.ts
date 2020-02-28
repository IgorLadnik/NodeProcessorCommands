import { Publisher, Consumer } from './rabbitmq';
import { Dictionary } from 'dictionaryjs';
import { Command } from './command';
import { SqlServerHelper } from './SqlServerHelper';

class Processor {
    static commandsDir = './commands/';
    static connUrl = 'amqp://localhost';
    static dctCommand = new Dictionary<string, any>();
    queueNames: Array<string>;
    publishers = new Dictionary<string, Publisher>();
    sqlServerHelper = new SqlServerHelper(); 

    constructor(...queueNames: Array<string>) {
        this.queueNames = queueNames;
    }

    async createPublishers() {
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i], await Publisher.start(Processor.connUrl, this.queueNames[i], true));
    }

    async startConsumers() {
        await this.sqlServerHelper.connect();
        
        let promises = new Array<Promise<Consumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(Consumer.start(Processor.connUrl, this.queueNames[i], async (msg: any) => 
                await Processor.getAndExecuteCommand(msg, 
                    { 
                        publishers: this.publishers, 
                        sqlServerHelper: this.sqlServerHelper 
                    })));
        await Promise.all(promises);
    }

    static async getAndExecuteCommand(msg: any, resources: any) {
        try {
            let messageInfo = {
                exchange: msg.fields.exchange,
                queueName: msg.fields.routingKey,
                consumerTag: msg.fields.consumerTag,
                deliveryTag: msg.fields.deliveryTag,
                redelivered: msg.fields.redelivered
            };

            let commandInfo = JSON.parse(msg.content.toString());

            let command: any = Processor.dctCommand.get(commandInfo.name);
            if (!command) {
                command = await import(`${Processor.commandsDir}${commandInfo.name}`);
                Processor.dctCommand.set(commandInfo.name, command);
            }

            await command.executeCommand(commandInfo.args, messageInfo, resources);
        }
        catch (err) {
            console.log(err);
        }
    }
}

(async function main() {
    const queueName: string = 'il-01';
    let commandName = 'cmdFirst';

    let processor = new Processor(queueName);
    await Promise.all([processor.startConsumers(), processor.createPublishers()]);

    setTimeout(() => 
        processor.publishers.get(queueName)
            .publish<Command>(queueName, new Command(commandName, {a: 'igor', n: 1})),
        1000);
})();  
