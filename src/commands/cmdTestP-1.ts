import { Message } from '../models/message';
import { IProcessor } from "../interfaces/iprocessor";

export async function command(args: any, p: IProcessor, message: Message): Promise<boolean> {
    const thisCommandName = 'cmdTestP';
    let logger = p.getLogger();
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} | message: ${JSON.stringify(message)}`);
    return true;
}
