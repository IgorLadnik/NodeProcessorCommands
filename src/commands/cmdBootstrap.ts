import { CommandInfo } from '../models/commandInfo';
import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../processor/iprocessor";
import { MessageBrokerFactory } from '../infrastructure/rabbitmqProvider';

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    await processor.getAndExecuteCommand(new CommandInfo('cmdLogger'), new MessageInfo());
    await processor.getAndExecuteCommand(new CommandInfo('cmdHttpServer'), new MessageInfo());
    processor.initMessangerFactory(new MessageBrokerFactory());

    let l = processor.getResource('logger');
    l.log('cmdBootstrap');

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
