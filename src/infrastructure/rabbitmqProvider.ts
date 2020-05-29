import { ILogger } from "../interfaces/ilogger";
import { IMessageBrokerFactory, IPublisher, IConsumer } from '../interfaces/messageInterfaces';
let amqp = require('amqplib');

export function create(): IMessageBrokerFactory { return new MessageBrokerFactory(); }

class MessageBrokerFactory implements IMessageBrokerFactory {
    async startPublisher(queueName: string, l: ILogger, shouldPurge: boolean): Promise<IPublisher> {
        let publisher = new Publisher(l)
        try {
            publisher = await publisher.createChannel(Connection.connUrl);
        }
        catch (err) {
            l.log(err);
        }

        if (shouldPurge)
            await publisher.purge(queueName);

        return publisher;
    }

    async startConsumer(queueName: string, l: ILogger, processCallback: any): Promise<IConsumer> {
        let consumer = await new Consumer(l).createChannel(Connection.connUrl);
        try {
            await consumer.startConsume(queueName, processCallback);
        }
        catch (err) {
            l.log(err);
        }

        return consumer;
    }
}

class Connection {
    static connUrl = 'amqp://guest:1237@localhost:5672';
    channel: any; 
    l: ILogger;

    constructor(l :ILogger) {
        this.l = l;
    }

    async connect(connUrl: string): Promise<void> {
        try {
            return await amqp.connect(connUrl);
        }
        catch (err) {
            this.l.log(err);
        }
    }
}

class Publisher extends Connection implements IPublisher {
    constructor(l :ILogger) {
        super(l);
    }

    async createChannel(connUrl: string): Promise<Publisher> {
        let conn: any = await super.connect(connUrl);
        try {
            this.channel = await conn.createConfirmChannel();
        }
        catch (err) {
            this.l.log(err);
        }

        return this;
    }

    async publishOneAny(queueName: string, content: any, persistent: boolean = false): Promise<void> {
        try {
            await this.channel.sendToQueue(queueName, content, {persistent});
        }
        catch (err) {
            this.l.log(err);
        }
    }

    async publishOne<T>(queueName: string, t: T, persistent: boolean = false): Promise<void> {
        await this.publishOneAny(queueName, Buffer.from(JSON.stringify(t)), persistent);
    }

    async publish<T>(queueName: string, arrT: Array<T>, persistent: boolean = false): Promise<void> {
        let promises = new Array<Promise<void>>();
        for (let i = 0; i < arrT.length; i++)
            promises.push(this.publishOne<T>(queueName, arrT[i], persistent));

        await Promise.all(promises);
    }

    async purge(queueName: string): Promise<void> {
        try {
            await this.channel.purgeQueue(queueName);
        }
        catch (err) {
            this.l.log(err);
        }
    }
}

 class Consumer extends Connection implements IConsumer {
    constructor(l :ILogger) {
        super(l);
    }
    
    async createChannel(connUrl: string): Promise<Consumer> {
        let conn: any = await super.connect(Connection.connUrl);
        try {
            this.channel = await conn.createChannel();
            await this.channel.prefetch();
        }
        catch (err) {
            this.l.log(err);
        }

        return this;
    }

    async startConsume(queueName: string, processCallback: any,  
                       durable: boolean = true, noAck: boolean = false)
                : Promise<Consumer> {
        try {
            await this.channel.assertQueue(queueName, {durable});
            await this.channel.consume(queueName, processCallback, {noAck});
        }
        catch (err) {
            this.l.log(err);
        }

        return this;
    }
}