import { CommandInfo } from '../commandInfo'; 
import { Publisher } from '../rabbitmq';
import { ItemInfo } from '../itemInfo';

export async function executeCommand(args: any, resources: any, itemInfo: ItemInfo, callback: any): Promise<any> { 
    const thisCommandName = 'cmdFirst';
    console.log(`${thisCommandName}: args: ${JSON.stringify(args)} | itemInfo: ${JSON.stringify(itemInfo)}`);

    let recordset: Array<any> = [];
    let isSqlConnected = false;

    if (resources.sql) {
        try {
            recordset = await resources.sql.simpleQuery('*', 'Pets');
            isSqlConnected = true;
        }
        catch (err) {
            // SQL server connection is not available
            console.log(err);
        }
    }
       
    let updatedResources = resources; 
    if (!isSqlConnected)
        // Establish connection to SQL server since it is not available at the moment
        updatedResources = await callback(new CommandInfo('cmdSqlConnect'), resources);

    setTimeout(() => { 
            let publisher: Publisher = resources.publishers.get(itemInfo.queueName);
            publisher.publish<CommandInfo>(itemInfo.queueName, 
                    new CommandInfo(thisCommandName, recordset[itemInfo.deliveryTag % recordset.length]));
        
    }, 1000);
        
    return updatedResources;
}

