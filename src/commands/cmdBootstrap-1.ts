import { CommandInfo } from '../models/commandInfo';
import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../interfaces/iprocessor";

export async function command(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    await processor.executeCommand(new CommandInfo('cmdHttpServer'), new MessageInfo());

    let logger = processor.getLogger();
    logger.log('cmdBootstrap');

    setTimeout(() =>
        processor.publishMany(processor.getQueueNames()[0],
            [
                new CommandInfo('cmdFirst', {a: 'aaa', n: 1}),
                new CommandInfo('cmdFirst', {a: 'qqq', n: 1})
            ],
        false),
    1000);

    setInterval(() =>
            processor.publishParallel(processor.getQueueNames()[0],
            [
                new CommandInfo('cmdTestP', {order: 1}),
                new CommandInfo('cmdTestP', {order: 2}),
                new CommandInfo('cmdTestP', {order: 3})
            ], false),
    370);
}
