import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor, message: any): Promise<boolean> {
    const thisCommandName = 'cmdRabbitMQCommandPublisher';
    let logger = p.getLogger();

    /*await*/ logger.log(`Command ${thisCommandName} started  args: ${JSON.stringify(args)} ${!message.isEmpty ? `, message: ${message}` : ''}`);

    const Command = require(`${p.workingDir}/models/command`).Command;
    const Config = (await import(`${p.workingDir}/config`)).Config;
    const _ = await import(`${p.stdImportDir}/lodash`);
    const Publisher = (await import(`${p.stdImportDir}/rabbitmq-provider/publisher`)).Publisher;
    
    const publisher = await Publisher.createPublisher(Config.messageBroker, logger);
    p.setResource('publisher', publisher);

    setInterval(async () =>
            await publisher.publishAsync(
                new Command('cmdFirstFetch', {a: 'aaa', n: 1}),
                new Command('cmdFirstFetch', {a: 'qqq', n: 1})),
        3000);

    setInterval(async () =>
            await publisher.publishAsync(
                new Command('cmdTestP', {order: 1}),
                new Command('cmdTestP', {order: 2}),
                new Command('cmdTestP', {order: 3})),
        1370);

    /*await*/ logger.log(`Command ${thisCommandName} ended`);
    
    return true;
}
