import { Command } from '../command'; 
import { Publisher } from '../rabbitmq';

export async function executeCommand(args: any, messageInfo: any, resources: any): Promise<void> { 
    console.log(`commandFirst.perform(): args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(messageInfo)}`);

    let recordset = await resources.sqlServerHelper.simpleQuery('*', 'Pets');
    //1 let n: number = parseFloat(args.n) + 1;
        
    setTimeout(() => {
        let publisher: Publisher = resources.publishers.get(messageInfo.queueName);
        publisher.publish<Command>(messageInfo.queueName, new Command('cmdFirst', recordset[messageInfo.deliveryTag % recordset.length]))
        //1 publisher.publish<Command>(messageInfo.queueName, new Command('cmdFirst', {a: `${args.a}`, n: `${n}`}))
    }, 1000);    
}

