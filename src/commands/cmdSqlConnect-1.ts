import { SqlServerProvider } from '../infrastructure/SqlServerProvider';
import { IProcessor } from "../interfaces/iprocessor";
import { MessageInfo } from "../models/messageInfo";
import { Config } from '../config';

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    let logger = processor.getLogger();
    logger.log(`cmdSqlConnect: args: ${JSON.stringify(args)}`);

    let server = Config.sqlServer;
    let database = Config.sqlDatabase;
    let sql = new SqlServerProvider({server, database}, logger);
    try {
        await sql.connect();
        processor.setResource('sql', sql);
    }
    catch (err) {
        logger.log(err);
    }
}

