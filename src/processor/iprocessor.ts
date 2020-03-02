import { CommandInfo } from '../models/commandInfo';

export interface IProcessor {
    getQueueNames(): Array<string>;
    publish(queueName: string, commandInfo: CommandInfo, persistent: boolean): Promise<void>;
    publishMany(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean): Promise<void>;
    publishParallel(queueName: string, arrCommandInfo: Array<CommandInfo>, persistent: boolean) : Promise<void>;
}
