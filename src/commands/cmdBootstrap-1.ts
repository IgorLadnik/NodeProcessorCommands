import { Command } from '../models/command';
import { IProcessor } from "../interfaces/iprocessor";

export async function command(args: any, processor: IProcessor/*, message: Message*/): Promise<void> {
    let logger = processor.getLogger();
    logger.log('cmdBootstrap');

    await processor.execute(new Command('cmdHttpServer'));

    // TEST stuff
    await processor.executeParallel(
        new Command('cmdTestP', {order: 1}),
        new Command('cmdTestP', {order: 2}),
        new Command('cmdTestP', {order: 3}));

    if (processor.isPublishConsumeSupported()) {
        setTimeout(async () =>
                await processor.publish(processor.getQueueNames()[0],
                    new Command('cmdFirst', {a: 'aaa', n: 1}),
                    new Command('cmdFirst', {a: 'qqq', n: 1})),
            1000);

        setInterval(async () =>
                await processor.publishParallel(processor.getQueueNames()[0],
                    new Command('cmdTestP', {order: 1}),
                    new Command('cmdTestP', {order: 2}),
                    new Command('cmdTestP', {order: 3})),
            370);
    }
}
