import _ from 'lodash'

export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdCreateHttpServer';
    let logger = p.getLogger();

    const Command = (await import(`${p.workingDir}/models/command`)).Command;
    const HttpServerProvider = (await import(`${p.workingDir}/infrastructure/httpServerProvider`)).HttpServerProvider;

    const port = args as number;
    const httpServer = new HttpServerProvider(port, logger).server;
    if (!_.isNil(httpServer)) {
        logger.log(`${thisCommandName}: http server created and is listening on port = ${port}`);

        //return await p.execute(new Command('cmdRest*', httpServer));
        return await p.execute(new Command('cmdRest', httpServer),
                               new Command('cmdRestA', httpServer));
    }

    return false;
}
