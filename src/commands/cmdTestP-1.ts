import { Message } from '../models/message';
import { IProcessor } from "../interfaces/iprocessor";
import { Utils } from "../infrastructure/utils";

export async function command(args: any, p: IProcessor, message: Message): Promise<boolean> {
    const thisCommandName = 'cmdTestP';
    let logger = p.getLogger();
    logger.log(`${thisCommandName}: Started`);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    await Utils.delay(100, logger);
    logger.log(`${thisCommandName}: Ended. args: ${JSON.stringify(args)} ${str}`);
    return true;
}
