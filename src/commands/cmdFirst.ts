import { CommandInfo } from '../commandInfo'; 
import { Publisher } from '../rabbitmq';

export async function executeCommand(args: any, itemInfo: any, resources: any, callback: any): Promise<any> { 
    console.log(`cmdFirst: args: ${JSON.stringify(args)} | itemInfo: ${JSON.stringify(itemInfo)}`);

    let recordset: Array<any> = [];
    let isSqlConnected = false;

    if (resources.sqlServerHelper) {
        try {
            recordset = await resources.sqlServerHelper.simpleQuery('*', 'Pets');
            isSqlConnected = true;
        }
        catch (err) {
            console.log(err);
        }
    }
       
    let updatedResources = resources; 
    if (!isSqlConnected)
        updatedResources = await callback(new CommandInfo('cmdSqlConnect', null), null, resources);

    setTimeout(() => { 
            let publisher: Publisher = resources.publishers.get(itemInfo.queueName);
            publisher.publish<CommandInfo>(itemInfo.queueName, 
                    new CommandInfo('cmdFirst', recordset[itemInfo.deliveryTag % recordset.length]));
        
    }, 1000);
        
    return updatedResources;
}

