import { Command } from "../models/command";
import { IProcessor } from "../interfaces/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Config } from '../config';

export async function command(args: any, p: IProcessor): Promise<boolean> {
    const thisCommandName = 'cmdHttpServer';
    let logger = p.getLogger();

    const port = Config.httpServer.ports[0];
    const httpServer = new HttpServerProvider(port, logger).server;
    logger.log(`${thisCommandName}: port = ${port}`);

    httpServer.get('/', async (req: any, res: any) => {
        await p.execute(new Command('cmdGetSample', {select: '*', from: 'Pets'}));

        let recordset = p.getResource('recordset');
        if (recordset) {
            p.deleteResource('recordset');
            try {
                res.send(`Hello World! ${JSON.stringify(recordset)}`);
            } catch (err) {
                logger.log(err);
            }
        }
    });

    httpServer.get('/a', async (req: any, res: any) => {
        p.setResource('res', res);
        setTimeout(async ()=> {
            await p.execute(new Command('cmdGetSample', {select: '*', from: 'Pets'}));

            let recordset = p.getResource('recordset');
            if (recordset) {
                p.deleteResource('recordset');
                try {
                    p.getResource('res').send(`Hello World! ${JSON.stringify(recordset)}`);
                    p.deleteResource('res');
                } catch (err) {
                    logger.log(err);
                }
            }
        }, 1);
    });

    return true;
}
