import { Processor } from './processor/processor';
import { CommandInfo } from './models/commandInfo';

(async function main() {
    const queueNames = ['il-01', 'il-02'];

    let processor = new Processor(...queueNames);
    await Promise.all([processor.startConsumers(), processor.createPublishers()]);
    await processor.getAndExecuteCommand(new CommandInfo('cmdInitial'), undefined);
})();
