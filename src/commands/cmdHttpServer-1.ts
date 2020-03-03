import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../interfaces/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Config } from '../config';
import {CommandInfo} from "../models/commandInfo";

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdHttpServer';
    let l = processor.getResource('logger');

    const port = Config.port;
    const httpServer = new HttpServerProvider(port as number, l).server;
    l.log(`${thisCommandName}: port = ${port}`);

    httpServer.get('/', async (req: any, res: any) => {
        await processor.getAndExecuteCommand(
            new CommandInfo('cmdGetSample', {select: '*', from: 'Pets'}),
            new MessageInfo());

        let recordset = processor.getResource('recordset');
        if (recordset) {
            processor.setResource('recordset', undefined);
            try {
                res.send(`Hello World! ${JSON.stringify(recordset)}`);
            } catch (err) {
                l.log(err);
            }
        }
    });
}
