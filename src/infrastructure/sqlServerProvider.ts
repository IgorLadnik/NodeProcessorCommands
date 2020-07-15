import _ from 'lodash';
import { SqlClient } from 'msnodesqlv8';
import { ILogger } from "../interfaces/ilogger";

export class SqlServerProvider {
    sql: SqlClient;
    connectionString: string;

    constructor(private readonly config: any, private l: ILogger) {
        this.l = l;
        this.sql = require('msnodesqlv8');
        this.connectionString = `Server=${config.server};` +
                                `Database=${config.database};` +
                                `Trusted_Connection=Yes;` +
                                'Driver={SQL Server Native Client 11.0}';
    }

    simpleQuery(select: string, from: string, where: string): Promise<Array<any>> {
        let suffix: string = '';
        if (where && where.length > 0)
            suffix = ` where ${where}`;

        let retRows = new Array<any>();
        return new Promise<Array<any>>((resolve: any) => {
            this.sql.query(this.connectionString, `select ${select} from ${from}${suffix}`,
                async (err, rows) => {
                    if (!_.isNil(err))
                        await this.l.log(`${err}`);

                    if (!_.isNil(rows))
                        retRows = rows;

                    resolve(retRows);
                });
        });
    }
}
