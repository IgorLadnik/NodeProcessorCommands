import { Command } from '../models/command';
import { ILogger } from './ilogger';

export interface IProcessor {
    // Get general info / resources from processor
    getId(): string;
    getLogger(): ILogger;

    // get / set custom resources from / to processor
    getResource(resourceName: string): any
    setResource(resourceName: string, resource: any): void;
    deleteResource(resourceName: string): void;

    // Immediate execution of commands
    execute(...commands: Array<Command>): Promise<boolean>;
    executeParallel(...commands: Array<Command>): Promise<boolean>;

    // Message broker (queueing) support is an optional. RabbitMQ is used as message broker in this project,
    // but other MQs may be used in stead since Publisher and Consumer are used through their interfaces.

    // Message broker related methods
    isMessageBrokerSupported(): boolean;
    getQueueNames(): Array<string>;
    publish(queueName: string, ...commands: Array<Command>): Promise<void>;
    publishParallel(queueName: string, ...commands: Array<Command>): Promise<void>;
}
