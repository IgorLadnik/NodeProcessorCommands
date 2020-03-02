import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../processor/iprocessor";

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdTestP';
    let l = processor.getResource('logger');
    l.log(`${thisCommandName}: args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(messageInfo)}`);
}
