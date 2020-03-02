import { CommandInfo } from '../models/commandInfo';
import { ItemInfo } from '../models/itemInfo';
import { IProcessor } from "../processor/iprocessor";
import { MessangerFactory } from '../infrastructure/rabbitmqProvider';

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    await processor.getAndExecuteCommand(new CommandInfo('cmdLogger'), undefined);
    await processor.getAndExecuteCommand(new CommandInfo('cmdHttpServer'), undefined);
    processor.initMessangerFactory(new MessangerFactory());

    let l = processor.getResource('logger');
    l.log('cmdInitial');

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
}
