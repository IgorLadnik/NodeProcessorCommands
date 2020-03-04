import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../interfaces/iprocessor";

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdTestP';
    let logger = processor.getLogger();
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(messageInfo)}`);
}
