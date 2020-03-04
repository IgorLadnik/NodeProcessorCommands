import { CommandInfo } from '../models/commandInfo';
import { ILogger } from './ilogger';
import { MessageInfo } from '../models/messageInfo';

export interface IProcessor {
    getLogger(): ILogger;
    getQueueNames(): Array<string>;
    publish(queueName: string, commandInfo: CommandInfo, persistent: boolean): Promise<void>;
    publishMany(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean): Promise<void>;
    publishParallel(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean) : Promise<void>;
    executeCommand(commandInfo: CommandInfo, messageInfo: MessageInfo): Promise<void>;
    getResource(resourceName: string): any
    setResource(resourceName: string, resource: any): void;
}
