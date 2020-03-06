import { Message } from '../models/message';
import { IProcessor } from '../interfaces/iprocessor';
import { Utils } from '../infrastructure/utils';

export async function command(args: any, p: IProcessor, message: Message): Promise<void> {
    const thisCommandName = 'cmdFirst';

    let logger = p.getLogger();

    let sql = p.getResource('sql');
    if (!Utils.isDefined(sql)) {
        Utils.setRetVal(p, false);
        return;
     }

    const dbTable = 'Pets';
    let recordset = new Array<any>();
    try {
        recordset = await sql.simpleQuery('*', dbTable);
    }
    catch (err) {
        logger.log(`Error in command \"${thisCommandName}\": failed to execute query to table \"${dbTable}\"`);
        Utils.setRetVal(p, false);
        return;
    }

    p.setResource('recordset', recordset);
    logger.log(`${thisCommandName}: args: ${JSON.stringify(recordset)} | message: ${JSON.stringify(message)}`);

    Utils.setRetVal(p, true);
}
