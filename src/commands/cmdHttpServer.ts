import { MessageInfo } from '../models/messageInfo';
import { IProcessor } from "../processor/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Config } from '../config';

export async function executeCommand(args: any, processor: IProcessor, messageInfo: MessageInfo): Promise<void> {
    const thisCommandName = 'cmdHttpServer';
    let l = processor.getResource('logger');

    const port = Config.port;
    const httpServer = new HttpServerProvider(port as number, l).server;
    l.log(`${thisCommandName}: port = ${port}`);

    httpServer.get('/', (req: any, res: any) => {
        try {
            res.send('Hello World!');
        }
        catch (err) {
            l.log(err);
        }
    });
}
