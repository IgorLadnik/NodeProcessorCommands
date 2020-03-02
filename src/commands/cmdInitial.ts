import { CommandInfo } from '../models/commandInfo';
import { ItemInfo } from '../models/itemInfo';
import {IProcessor} from "../processor/iprocessor";

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    console.log('cmdInitial');

    setTimeout(() =>
        processor.publishMany(processor.getQueueNames()[0],
            [
                new CommandInfo('cmdFirst', {a: 'aaa', n: 1}),
                new CommandInfo('cmdFirst', {a: 'qqq', n: 1})
            ],
        false),
    1000);

    setInterval(() =>
            processor.publishMany(processor.getQueueNames()[0],
            [
                new CommandInfo('cmdTestP', {order: 1}),
                new CommandInfo('cmdTestP', {order: 2}),
                new CommandInfo('cmdTestP', {order: 3})
            ], false),
    370);

    await processor.getAndExecuteCommand(new CommandInfo('cmdHttpServer'), undefined);
}
