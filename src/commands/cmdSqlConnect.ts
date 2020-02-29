import { SqlServerProvider } from '../SqlServerProvider';

export async function executeCommand(args: any, resources: any): Promise<any> { 
    console.log(`cmdSqlConnect: args: ${JSON.stringify(args)}`);

    let updateResources = resources;
    let sql = new SqlServerProvider({server: 'IGORMAIN\\MSSQLSERVER01', database: 'PetsDb'}); 
    try {
        await sql.connect();
        updateResources.sql = sql;
    }
    catch (err) {
        console.log(err);
    }

    return updateResources;
}

