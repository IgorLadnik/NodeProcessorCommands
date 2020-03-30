import { IProcessor } from "../interfaces/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Utils } from "../infrastructure/utils";
import { Command } from "../models/command";

export async function command(args: any, p: IProcessor): Promise<boolean> {
    const thisCommandName = 'cmdCreateHttpServer';
    let logger = p.getLogger();

    const port = args as number;
    const httpServer = new HttpServerProvider(port, logger).server;
    if (Utils.isValid(httpServer)) {
        logger.log(`${thisCommandName}: http server created and is listening on port = ${port}`);

        //return await p.execute(new Command('cmdRest*', httpServer));
        return await p.execute(new Command('cmdRest', httpServer),
                               new Command('cmdRestA', httpServer));
    }

    return false;
}
