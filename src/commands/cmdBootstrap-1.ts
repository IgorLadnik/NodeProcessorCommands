import { Command } from '../models/command';
import { IProcessor } from "../interfaces/iprocessor";

export async function command(args: any, p: IProcessor): Promise<void> {
    const thisCommandName = 'cmdBootstrap';
    let logger = p.getLogger();
    logger.log(thisCommandName);

    await p.execute(new Command('cmdHttpServer'));

    if (!await p.executeRepetitive(
        new Command('cmdFirstFetch', {a: 'aaa', n: 1}),
        new Command('cmdSqlConnect'))) {
            logger.log(`Error in command \"${thisCommandName}\": execution terminated`);
            return;
    }

    // TEST stuff
    await p.executeParallel(
        new Command('cmdTestP', {order: 1}),
        new Command('cmdTestP', {order: 2}),
        new Command('cmdTestP', {order: 3}));

    if (p.isMessageBrokerSupported()) {
        setInterval(async () =>
                await p.publish(p.getQueueNames()[0],
                    new Command('cmdFirstFetch', {a: 'aaa', n: 1}),
                    new Command('cmdFirstFetch', {a: 'qqq', n: 1})),
            3000);

        setInterval(async () =>
                await p.publishParallel(p.getQueueNames()[0],
                    new Command('cmdTestP', {order: 1}),
                    new Command('cmdTestP', {order: 2}),
                    new Command('cmdTestP', {order: 3})),
            1370);
    }
}


