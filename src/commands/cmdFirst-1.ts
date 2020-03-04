import { CommandInfo } from '../models/commandInfo';
import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdFirst';
    let logger = processor.getLogger();

    let recordset: Array<any> = [];

    let sql = processor.getResource('sql');
    if (sql === undefined) {
        await processor.executeCommand(new CommandInfo('cmdSqlConnect'), new MessageInfo());
        sql = processor.getResource('sql');
    }

    if (sql !== undefined) {
        let recordset = await sql.simpleQuery('*', 'Pets');
        processor.setResource('recordset', recordset);
        logger.log(`${thisCommandName}: args: ${JSON.stringify(recordset)} | messageInfo: ${JSON.stringify(messageInfo)}`);
    }

    setTimeout(async () =>
        await processor.publish(messageInfo.queueName,
            new CommandInfo(thisCommandName, recordset[messageInfo.deliveryTag % recordset.length]), false)
    , 1000);

    // await processor.publish(messageInfo.queueName,
    //     new CommandInfo(thisCommandName, recordset[messageInfo.deliveryTag % recordset.length]), false);
}


