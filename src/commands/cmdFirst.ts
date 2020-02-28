import { Command } from '../command'; 
import { Publisher } from '../rabbitmq';

export async function executeCommand(args: any, messageInfo: any, resources: any): Promise<any> { 
    console.log(`cmdFirst: args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(messageInfo)}`);

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

    let publisher: Publisher = resources.publishers.get(messageInfo.queueName);
        
    if (!isSqlConnected)
        publisher.publish<Command>(messageInfo.queueName, new Command('cmdSqlConnect', {server: 'IGORMAIN\\MSSQLSERVER01', database: 'PetsDb'}));

    setTimeout(() => 
            publisher.publish<Command>(messageInfo.queueName, new Command('cmdFirst', recordset[messageInfo.deliveryTag % recordset.length]))
        , 1000);
        
    return resources;
}

