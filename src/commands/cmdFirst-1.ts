import { Command } from '../models/command';
import { Message } from '../models/message';
import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, processor: IProcessor, message: Message): Promise<void> {
    const thisCommandName = 'cmdFirst';
    let logger = processor.getLogger();

    let recordset = new Array<any>();

    let sql = processor.getResource('sql');
    if (sql === undefined) {
        await processor.execute(new Command('cmdSqlConnect'));
        sql = processor.getResource('sql');
    }

    const dbTable = 'Pets';
    if (sql !== undefined) {
        recordset = await sql.simpleQuery('*', dbTable);
        processor.setResource('recordset', recordset);
        logger.log(`${thisCommandName}: args: ${JSON.stringify(recordset)} | messageInfo: ${JSON.stringify(message)}`);
    }
    else
        logger.log('Error: SQL database with table \"${dbTable}\"is not available');

    if (processor.isPublishConsumeSupported()) {
        setTimeout(async () => await processor.publish(message.queueName,
            new Command(thisCommandName, recordset[message.deliveryTag % recordset.length]))
            , 1000);

        // await processor.publish(messageInfo.queueName,
        //     new CommandInfo(thisCommandName, recordset[messageInfo.deliveryTag % recordset.length]), false);
    }
}


