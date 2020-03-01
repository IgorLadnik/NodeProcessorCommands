import { Processor } from './processor';
import { CommandInfo } from './models/commandInfo';

(async function main() {
    const queueNames = ['il-01', 'il-02'];

    let processor = new Processor(...queueNames);
    await Promise.all([processor.startConsumers(), processor.createPublishers()]);

    setTimeout(() =>
        processor.publishMany(queueNames[0],
                [
                    new CommandInfo('cmdFirst', {a: 'aaa', n: 1}),
                    new CommandInfo('cmdFirst', {a: 'qqq', n: 1})
                ],
            false),
        1000);

    setInterval(() =>
            processor.publishParallel(queueNames[0],
                        [
                            new CommandInfo('cmdTestP', {order: 1}),
                            new CommandInfo('cmdTestP', {order: 2}),
                            new CommandInfo('cmdTestP', {order: 3})
                        ], false),
        370);
})();
