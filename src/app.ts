import { Processor } from './processor/processor';

(async function main() {
    let processor = await new Processor().init();
})();
