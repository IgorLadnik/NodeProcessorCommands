import { CommandInfo } from '../models/commandInfo';
import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../interfaces/iprocessor";

export async function command(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    await processor.execute(new CommandInfo('cmdHttpServer'));

    let logger = processor.getLogger();
    logger.log('cmdBootstrap');

    // TEST stuff
    await processor.executeParallel(
        new CommandInfo('cmdTestP', {order: 1}),
        new CommandInfo('cmdTestP', {order: 2}),
        new CommandInfo('cmdTestP', {order: 3}));

    setTimeout(async () =>
        await processor.publish(processor.getQueueNames()[0],
                new CommandInfo('cmdFirst', {a: 'aaa', n: 1}),
                new CommandInfo('cmdFirst', {a: 'qqq', n: 1})),
    1000);

    setInterval(async () =>
            await processor.publishParallel(processor.getQueueNames()[0],
                new CommandInfo('cmdTestP', {order: 1}),
                new CommandInfo('cmdTestP', {order: 2}),
                new CommandInfo('cmdTestP', {order: 3})),
    370);
}
