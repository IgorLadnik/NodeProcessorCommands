import { CommandInfo } from '../models/commandInfo';
import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from '../processor/iprocessor';

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdFirst';
    let l = processor.getResource('logger');
    l.log(`${thisCommandName}: args: ${JSON.stringify(args)} | messageInfo: ${JSON.stringify(messageInfo)}`);

    let recordset: Array<any> = [];

    let sql = processor.getResource('sql');
    if (sql === undefined) {
        try {
            await processor.getAndExecuteCommand(new CommandInfo('cmdSqlConnect'), new MessageInfo());
        }
        catch (err) {
            l.log(err);
        }
    }

    sql = processor.getResource('sql');
    if (sql !== undefined) {
        try {
            recordset = await sql.simpleQuery('*', 'Pets');
        } catch (err) {
            l.log(err);
        }
    }
    else {
        l.log('No connection to SQL Server');
    }

    setTimeout(async () =>
        await processor.publish(messageInfo.queueName,
            new CommandInfo(thisCommandName, recordset[messageInfo.deliveryTag % recordset.length]), false)
    , 1000);

    // await processor.publish(messageInfo.queueName,
    //     new CommandInfo(thisCommandName, recordset[messageInfo.deliveryTag % recordset.length]), false);
}


