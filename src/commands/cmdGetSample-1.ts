import { Command } from '../models/command';
import { Message } from '../models/message';
import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, processor: IProcessor, message: Message): Promise<void> {
    const thisCommandName = 'cmdGetSample';
    let logger = processor.getLogger();

    let sql = processor.getResource('sql');
    if (sql === undefined) {
        await processor.execute(new Command('cmdSqlConnect'));
        sql = processor.getResource('sql');
    }

    if (sql !== undefined) {
        let recordset = await sql.simpleQuery(args.select, args.from);
        processor.setResource('recordset', recordset);
        logger.log(`${thisCommandName}: args: ${JSON.stringify(recordset)} | messageInfo: ${JSON.stringify(message)}`);
    }
}



