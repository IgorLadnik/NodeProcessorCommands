import { ItemInfo } from '../models/itemInfo';
import { IProcessor } from "../processor/iprocessor";

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    const thisCommandName = 'cmdTestP';
    let l = processor.getResource('logger');
    l.log(`${thisCommandName}: args: ${JSON.stringify(args)} | itemInfo: ${JSON.stringify(itemInfo)}`);
}
