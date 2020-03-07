import { Command } from '../models/command';
import { Message } from '../models/message';
import { IProcessor } from '../interfaces/iprocessor';
import { Utils } from "../infrastructure/utils";

export async function command(args: any, p: IProcessor, message: Message): Promise<boolean> {
    const thisCommandName = 'cmdGetSample';
    let logger = p.getLogger();

    let sql = p.getResource('sql');
    if (!Utils.isValid(sql)) {
        await p.execute(new Command('cmdSqlConnect'));
        sql = p.getResource('sql');
    }

    if (!Utils.isValid(sql))
        return false;

    let recordset = await sql.simpleQuery(args.select, args.from);
    p.setResource('recordset', recordset);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} ${str}`);

    return true;
}



