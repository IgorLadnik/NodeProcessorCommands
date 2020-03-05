import { CommandInfo } from '../models/commandInfo';
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
    execute(...commandInfo: Array<CommandInfo>): Promise<void>;
    executeParallel(...commandInfo: Array<CommandInfo>): Promise<void>;

    // Queueing commands
    publish(queueName: string, ...arrCommandInfo: Array<CommandInfo>): Promise<void>;
    publishParallel(queueName: string, ...arrCommandInfo: Array<CommandInfo>) : Promise<void>;
}
