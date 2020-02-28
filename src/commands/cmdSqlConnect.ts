import { SqlServerHelper } from '../SqlServerHelper';

export async function executeCommand(args: any, messageInfo: any, resources: any): Promise<any> { 
    console.log(`cmdSqlConnect: args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(messageInfo)}`);

    let updateResources = resources;
    let sqlServerHelper = new SqlServerHelper(args); 
    try {
        await sqlServerHelper.connect();
        updateResources.sqlServerHelper = sqlServerHelper;
    }
    catch (err) {
        console.log(err);
    }

    return updateResources;
}

