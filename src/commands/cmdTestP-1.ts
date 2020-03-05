import { Message } from '../models/message';
import { IProcessor } from "../interfaces/iprocessor";

export async function command(args: any, processor: IProcessor, message: Message): Promise<void> {
    const thisCommandName = 'cmdTestP';
    let logger = processor.getLogger();
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} | message: ${JSON.stringify(message)}`);
}
