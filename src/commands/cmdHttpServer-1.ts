import { Command } from "../models/command";
import { IProcessor } from "../interfaces/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Config } from '../config';

export async function command(args: any, processor: IProcessor): Promise<void> {
    const thisCommandName = 'cmdHttpServer';
    let logger = processor.getLogger();

    const port = Config.port;
    const httpServer = new HttpServerProvider(port, logger).server;
    logger.log(`${thisCommandName}: port = ${port}`);

    httpServer.get('/', async (req: any, res: any) => {
        await processor.execute(new Command('cmdGetSample', {select: '*', from: 'Pets'}));

        let recordset = processor.getResource('recordset');
        if (recordset) {
            processor.deleteResource('recordset');
            try {
                res.send(`Hello World! ${JSON.stringify(recordset)}`);
            } catch (err) {
                logger.log(err);
            }
        }
    });

    httpServer.get('/a', async (req: any, res: any) => {
        processor.setResource('res', res);
        setTimeout(async ()=> {
            await processor.execute(new Command('cmdGetSample', {select: '*', from: 'Pets'}));

            let recordset = processor.getResource('recordset');
            if (recordset) {
                processor.deleteResource('recordset');
                try {
                    processor.getResource('res').send(`Hello World! ${JSON.stringify(recordset)}`);
                    processor.deleteResource('res');
                } catch (err) {
                    logger.log(err);
                }
            }
        }, 1);
    });
}
