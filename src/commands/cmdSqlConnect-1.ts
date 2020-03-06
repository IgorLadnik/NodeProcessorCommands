import { SqlServerProvider } from '../infrastructure/SqlServerProvider';
import { IProcessor } from "../interfaces/iprocessor";
import { Config } from '../config';

export async function command(args: any, p: IProcessor): Promise<boolean> {
    let logger = p.getLogger();
    logger.log(`cmdSqlConnect: args: ${JSON.stringify(args)}`);

    let server = Config.sqlServer;
    let database = Config.sqlDatabase;
    let sql = new SqlServerProvider({server, database}, logger);
    try {
        await sql.connect();
        p.setResource('sql', sql);
        return true;
    }
    catch (err) {
        logger.log(err);
        return false;
    }
}

