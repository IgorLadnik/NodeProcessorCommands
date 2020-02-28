import { Command } from '../command'; 
import { Publisher } from '../rabbitmq';

export function executeCommand(args: any, messageInfo: any, resources: any): void { 
    console.log(`commandFirst.perform(): args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(messageInfo)}`);

    let n: number = parseFloat(args.n) + 1;
    
    setTimeout(() => {
        let publisher: Publisher = resources.publishers.get(messageInfo.queueName);
        publisher.publish<Command>(messageInfo.queueName, new Command('commandFirst', {a: `${args.a}`, n: `${n}`}))
    }, 1000);    
}

