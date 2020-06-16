import { Command } from '../models/command';
import { ILogger } from './ilogger';

export interface IProcessor {
    // Get general info / resources from processor
    readonly id: string;
    readonly workingDir: string;
    readonly stdImportDir: string;
    readonly parallelCmdName: string;
    getLogger(): ILogger;

    // get / set custom resources from / to processor
    getResource(resourceName: string): any
    setResource(resourceName: string, resource: any): void;
    deleteResource(resourceName: string): void;

    // Immediate execution of commands
    execute(...commands: Array<Command>): Promise<boolean>;
    executeParallel(...commands: Array<Command>): Promise<boolean>;
    executeFork(delayInMs: number, ...commands: Array<Command>): void;
    executeForkParallel(delayInMs: number, ...commands: Array<Command>): void;
    getCommandFromQueueMessageAndExecute(item: any): Promise<void>; //TEMP
}
