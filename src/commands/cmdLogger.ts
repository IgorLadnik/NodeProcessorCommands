import { ItemInfo } from '../models/itemInfo';
import { IProcessor } from "../processor/iprocessor";
import { Logger } from "../infrastructure/logger";

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    const thisCommandName = 'cmdLogger';

    let logger = new Logger();
    logger.log(`${thisCommandName}`);

    processor.addResource('logger', logger);
}
