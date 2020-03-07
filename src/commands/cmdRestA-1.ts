import { Command } from "../models/command";
import { IProcessor } from "../interfaces/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Config } from '../config';
import {Utils} from "../infrastructure/utils";

export async function command(args: any, p: IProcessor): Promise<boolean> {
    const thisCommandName = 'cmdRestA';
    let logger = p.getLogger();

    let httpServer = p.getResource('httpServer');
    if (!Utils.isValid(httpServer)) {
        logger.log(`Error in command \"${thisCommandName}\" http server is not available`);
        return false;
    }

    logger.log(`Command \"${thisCommandName}\" http GET on root/a created`);
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
