const sql = require('mssql/msnodesqlv8');
import { ILogger } from "../interfaces/ilogger";

export class SqlServerProvider {
    constructor(private readonly config: any, private l: ILogger) {
        this.l = l;
        this.config = {
            server: config.server, 
            database: config.database,

            options: {
                trustedConnection: true
            }
        }
    }

    async connect() {
        try {
            await sql.connect(this.config);
        }
        catch (err) {
            await this.l.log(err);
        }
    } 

    async simpleQuery(select: string, from: string, where: string): Promise<Array<any>> {
        let suffix: string = '';
        if (where && where.length > 0)
            suffix = ` where ${where}`;

        let request = new sql.Request(); 
        let retRecordset = new Array<any>();         
        try {
            retRecordset = (await request.query(`select ${select} from ${from}${suffix}`)).recordset;     
        }
        catch (err) {
            await this.l.log(err);
        }

        return retRecordset;         
    }
}
