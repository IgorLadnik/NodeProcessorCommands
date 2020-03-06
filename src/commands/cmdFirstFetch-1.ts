import { Message } from '../models/message';
import { IProcessor } from '../interfaces/iprocessor';
import { Utils } from '../infrastructure/utils';

export async function command(args: any, p: IProcessor, message: Message): Promise<boolean> {
    const thisCommandName = 'cmdFirstFetch';
    let logger = p.getLogger();

    let sql = p.getResource('sql');
    if (!Utils.isDefined(sql))
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
    logger.log(`${thisCommandName}: args: ${JSON.stringify(recordset)} | message: ${JSON.stringify(message)}`);

    return true;
}
