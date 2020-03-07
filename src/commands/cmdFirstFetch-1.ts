import { Message } from '../models/message';
import { IProcessor } from '../interfaces/iprocessor';
import { Utils } from '../infrastructure/utils';

export async function command(args: any, p: IProcessor, message: Message): Promise<boolean> {
    const thisCommandName = 'cmdFirstFetch';
    let logger = p.getLogger();

    let sql = p.getResource('sql');
    if (!Utils.isValid(sql))
        return false;

    const dbTable = 'Pets';
    let recordset = new Array<any>();
    try {
        recordset = await sql.simpleQuery('*', dbTable);
    }
    catch (err) {
        logger.log(`Error in command \"${thisCommandName}\": failed to execute query to table \"${dbTable}\"`);
        return false;
    }

    p.setResource('recordset', recordset);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} ${str}`);

    return true;
}
