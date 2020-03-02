import { Processor } from './processor/processor';
import { CommandInfo } from './models/commandInfo';

(async function main() {
    const queueNames = ['il-01', 'il-02'];

    let processor = await new Processor(...queueNames).init();
})();
