export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdCreateHttpServer';
    let logger = p.getLogger();

    const Command = require(p.getWorkingDir() + '/models/command').Command;
    const HttpServerProvider = require(p.getWorkingDir() + '/infrastructure/httpServerProvider').HttpServerProvider;
    const Utils = require(p.getWorkingDir() + '/infrastructure/utils').Utils;

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
