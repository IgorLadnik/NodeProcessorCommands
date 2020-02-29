let amqp = require('amqplib');
//import { Buffer } from 'buffer';

class Connection {
    static connUrl = 'amqp://localhost';
    channel: any; 

    async connect(connUrl: string): Promise<void> {
        try {
            return await amqp.connect(connUrl);
        }
        catch (err) {
            console.log(err);
        }
    }
}

export class Publisher extends Connection {
    async createChannel(connUrl: string): Promise<Publisher> {
        let conn: any = await super.connect(connUrl);
        try {
            this.channel = await conn.createConfirmChannel();
        }
        catch (err) {
            console.log(err);
        }

        return this;
    }

    async publishAny(queueName: string, content: any, persistent: boolean = false): Promise<void> {
        try {
            await this.channel.sendToQueue(queueName, content, {persistent});
        }
        catch (err) {
            console.log(err);
        }
    }

    async publish<T>(queueName: string, t: T, persistent: boolean = false): Promise<void> {
        return await this.publishAny(queueName, Buffer.from(JSON.stringify(t)), persistent);
    }

    async purge(queueName: string): Promise<void> {
        try {
            await this.channel.purgeQueue(queueName);
        }
        catch (err) {
            console.log(err);
        }
    }

    static async start(queueName: string, shouldPurge: boolean): Promise<Publisher> {
        let publisher = new Publisher()
        try {
            publisher = await publisher.createChannel(Connection.connUrl);
        }
        catch (err) {
            console.log(err);
        }

        if (shouldPurge)
            await publisher.purge(queueName);

        return publisher;
    }
}

export class Consumer extends Connection {
    async createChannel(connUrl: string): Promise<Consumer> {
        let conn: any = await super.connect(Connection.connUrl);
        try {
            this.channel = await conn.createChannel();
            await this.channel.prefetch();
        }
        catch (err) {
            console.log(err);
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
            console.log(err);
        }

        return this;
    }
    
    static async start(queueName: string, processCallback: any): Promise<Consumer> {
        let consumer = await new Consumer().createChannel(Connection.connUrl);
        try {
            await consumer.startConsume(queueName, processCallback);
        }
        catch (err) {
            console.log(err);
        }

        return consumer;
    }   
}