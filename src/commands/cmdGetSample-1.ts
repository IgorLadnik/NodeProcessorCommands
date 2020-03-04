import { CommandInfo } from '../models/commandInfo';
import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from '../interfaces/iprocessor';

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdGetSample';
    let logger = processor.getLogger();

    let sql = processor.getResource('sql');
    if (sql === undefined) {
        await processor.getAndExecuteCommand(new CommandInfo('cmdSqlConnect'), new MessageInfo());
        sql = processor.getResource('sql');
    }

    if (sql !== undefined) {
        let recordset = await sql.simpleQuery(args.select, args.from);
        processor.setResource('recordset', recordset);
        logger.log(`${thisCommandName}: args: ${JSON.stringify(recordset)} | messageInfo: ${JSON.stringify(messageInfo)}`);
    }
}



