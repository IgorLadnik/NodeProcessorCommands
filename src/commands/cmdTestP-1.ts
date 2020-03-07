import { Message } from '../models/message';
import { IProcessor } from "../interfaces/iprocessor";

export async function command(args: any, p: IProcessor, message: Message): Promise<boolean> {
    const thisCommandName = 'cmdTestP';
    let logger = p.getLogger();
    let str = !message.isEmpty ? `| message: ${message}` : '';
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} ${str}`);
    return true;
}
