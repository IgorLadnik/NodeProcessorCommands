import { CommandInfo } from '../models/commandInfo';
import { IMessangerFactory } from '../interfaces/messageInterfaces';
import { MessageInfo } from '../models/messageInfo';

export interface IProcessor {
    initMessangerFactory(messangerFactory: IMessangerFactory): void;
    getQueueNames(): Array<string>;
    publish(queueName: string, commandInfo: CommandInfo, persistent: boolean): Promise<void>;
    publishMany(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean): Promise<void>;
    publishParallel(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean) : Promise<void>;
    getAndExecuteCommand(commandInfo: CommandInfo, messageInfo: MessageInfo): Promise<void>;
    getResource(resourceName: string): any
    addResource(resourceName: string, resource: any): void;
}
