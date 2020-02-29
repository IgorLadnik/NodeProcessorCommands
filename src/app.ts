import { Processor } from './processor';
import { CommandInfo } from './models/commandInfo';

(async function main() {
    const queueNames = ['il-01', 'il-02'];

    let processor = new Processor(...queueNames);
    await Promise.all([processor.startConsumers(), processor.createPublishers()]);

    setTimeout(() => 
        processor.publishers.get(queueNames[0])
            .publish<CommandInfo>(queueNames[0], new CommandInfo('cmdFirst', {a: 'aaa', n: 1})),
        1000);
})();  
