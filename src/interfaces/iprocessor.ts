import { Command } from '../models/command';
import { ILogger } from './ilogger';

export interface IProcessor {
    // Get general info / resources from processor
    getId(): string;
    getLogger(): ILogger;
    getQueueNames(): Array<string>;

    // get / set custom resources from / to processor
    getResource(resourceName: string): any
    setResource(resourceName: string, resource: any): void;

    // Immediate execution of commands
    execute(...commands: Array<Command>): Promise<void>;
    executeParallel(...commands: Array<Command>): Promise<void>;

    // Queueing commands
    publish(queueName: string, ...commands: Array<Command>): Promise<void>;
    publishParallel(queueName: string, ...commands: Array<Command>) : Promise<void>;
}
