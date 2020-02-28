const sql = require('mssql/msnodesqlv8');

export class SqlServerHelper {
    config: any;

    constructor() {
        this.config = {
            server: 'IGORMAIN\\MSSQLSERVER01', 
            database: 'PetsDb',

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
            console.log(err);
        }
    } 

    async simpleQuery(select: string, from: string, where: string):Promise<any> {
        let suffix: string = '';
        if (where && where.length > 0)
            suffix = ` where ${where}`;

        let request = new sql.Request();          
        return (await request.query(`select ${select} from ${from}${suffix}`)).recordset;     
    }
}
