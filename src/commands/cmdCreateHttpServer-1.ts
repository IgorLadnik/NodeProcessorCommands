import { IProcessor } from "../interfaces/iprocessor";
import { HttpServerProvider } from '../infrastructure/httpServerProvider';
import { Config } from '../config';
import { Utils } from "../infrastructure/utils";

export async function command(args: any, p: IProcessor): Promise<boolean> {
    const thisCommandName = 'cmdHttpServer';
    let logger = p.getLogger();

    const port = Config.httpServer.ports[args];
    const httpServer = new HttpServerProvider(port, logger).server;
    if (Utils.isValid(httpServer)) {
        p.setResource('httpServer', httpServer);
        logger.log(`${thisCommandName}: http server created and is listening on port = ${port}`);
        return true;
    }

    return false;
}
