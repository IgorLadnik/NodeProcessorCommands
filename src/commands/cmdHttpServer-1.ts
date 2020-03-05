import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../interfaces/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Config } from '../config';
import {CommandInfo} from "../models/commandInfo";

export async function command(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdHttpServer';
    let logger = processor.getLogger();

    const port = Config.port;
    const httpServer = new HttpServerProvider(port as number, logger).server;
    logger.log(`${thisCommandName}: port = ${port}`);

    httpServer.get('/', async (req: any, res: any) => {
        await processor.execute(new CommandInfo('cmdGetSample', {select: '*', from: 'Pets'}));

        let recordset = processor.getResource('recordset');
        if (recordset) {
            processor.setResource('recordset', undefined);
            try {
                res.send(`Hello World! ${JSON.stringify(recordset)}`);
            } catch (err) {
                logger.log(err);
            }
        }
    });
}
