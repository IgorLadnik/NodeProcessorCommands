import { SqlServerProvider } from '../infrastructure/SqlServerProvider';
import { IProcessor } from "../processor/iprocessor";
import { ItemInfo } from "../models/itemInfo";
import { Config } from '../config';

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    let l = processor.getResource('logger');
    l.log(`cmdSqlConnect: args: ${JSON.stringify(args)}`);

    let server = Config.sqlServer;
    let database = Config.sqlDatabase;
    let sql = new SqlServerProvider({server, database}, l);
    try {
        await sql.connect();
        processor.addResource('sql', sql);
    }
    catch (err) {
        l.log(err);
    }
}

