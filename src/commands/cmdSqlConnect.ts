import { SqlServerHelper } from '../SqlServerHelper';

export async function executeCommand(args: any, itemInfo: any, resources: any): Promise<any> { 
    console.log(`cmdSqlConnect: args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(itemInfo)}`);

    let updateResources = resources;
    let sqlServerHelper = new SqlServerHelper({server: 'IGORMAIN\\MSSQLSERVER01', database: 'PetsDb'}); 
    try {
        await sqlServerHelper.connect();
        updateResources.sqlServerHelper = sqlServerHelper;
    }
    catch (err) {
        console.log(err);
    }

    return updateResources;
}

