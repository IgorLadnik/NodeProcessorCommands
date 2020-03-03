import { CommandInfo } from '../models/commandInfo';
import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from '../interfaces/iprocessor';

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdGetSample';
    let l = processor.getResource('logger');

    let sql = processor.getResource('sql');
    if (sql === undefined) {
        await processor.getAndExecuteCommand(new CommandInfo('cmdSqlConnect'), new MessageInfo());
        sql = processor.getResource('sql');
    }

    if (sql !== undefined) {
        let recordset = await sql.simpleQuery(args.select, args.from);
        processor.setResource('recordset', recordset);
        l.log(`${thisCommandName}: args: ${JSON.stringify(recordset)} | messageInfo: ${JSON.stringify(messageInfo)}`);
    }
}



