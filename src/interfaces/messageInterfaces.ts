import { ILogger } from "./ilogger";

export interface IMessangerFactory {
    startPublisher(queueName: string, l: ILogger, shouldPurge: boolean): Promise<IPublisher>;
    startConsumer(queueName: string, l: ILogger, processCallback: any): Promise<IConsumer>;
}

export interface IPublisher {
    publish<T>(queueName: string, t: T, persistent: boolean): Promise<void>;
    publishMany<T>(queueName: string, arrT: Array<T>, persistent: boolean): Promise<void>;
}

export interface IConsumer {
    startConsume(queueName: string, processCallback: any, durable: boolean, noAck: boolean): Promise<IConsumer>
}
