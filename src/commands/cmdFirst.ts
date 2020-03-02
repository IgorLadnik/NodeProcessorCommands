import { CommandInfo } from '../models/commandInfo';
import { ItemInfo } from '../models/itemInfo';
import { IProcessor } from '../processor/iprocessor';

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    const thisCommandName = 'cmdFirst';
    console.log(`${thisCommandName}: args: ${JSON.stringify(args)} | itemInfo: ${JSON.stringify(itemInfo)}`);

    let recordset: Array<any> = [];

    let sql = processor.getResource('sql');
    if (sql === undefined) {
        try {
            await processor.getAndExecuteCommand(new CommandInfo('cmdSqlConnect'), undefined);
        }
        catch (err) {
            console.log(err);
        }
    }

    sql = processor.getResource('sql');
    if (sql !== undefined) {
        try {
            recordset = await sql.simpleQuery('*', 'Pets');
        } catch (err) {
            console.log(err);
        }
    }
    else {
        console.log('No connection to SQL Server');
    }

    setTimeout(async () =>
        await processor.publish(itemInfo.queueName,
            new CommandInfo(thisCommandName, recordset[itemInfo.deliveryTag % recordset.length]), false)
    , 1000);

    // await processor.publish(itemInfo.queueName,
    //     new CommandInfo(thisCommandName, recordset[itemInfo.deliveryTag % recordset.length]), false);
}


