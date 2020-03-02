import { SqlServerProvider } from '../infrastructure/SqlServerProvider';
import { IProcessor } from "../processor/iprocessor";
import { ItemInfo } from "../models/itemInfo";

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    let l = processor.getResource('logger');
    l.log(`cmdSqlConnect: args: ${JSON.stringify(args)}`);

    let sql = new SqlServerProvider({server: 'IGORMAIN\\MSSQLSERVER01', database: 'PetsDb'}, l);
    try {
        await sql.connect();
        processor.addResource('sql', sql);
    }
    catch (err) {
        l.log(err);
    }
}

