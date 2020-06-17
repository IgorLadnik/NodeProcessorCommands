import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor): Promise<boolean> {
    const thisCommandName = 'cmdCreateHttpServer';
    let logger = p.getLogger();

    const _ = await import(`${p.stdImportDir}/lodash`);
    const Command = (await import(`${p.workingDir}/models/command`)).Command;
    const HttpServerProvider = (await import(`${p.workingDir}/infrastructure/httpServerProvider`)).HttpServerProvider;

    const port = args as number;
    const httpServer = await new HttpServerProvider(port, logger).start();
    if (!_.isNil(httpServer)) {
        await logger.log(`${thisCommandName}: http server created and is listening on port = ${port}`);

        //return await p.execute(new Command('cmdRest*', httpServer));
        return await p.execute(new Command('cmdRest', httpServer),
                               new Command('cmdRestA', httpServer),
                               new Command('cmdRestPost', httpServer),
                               );
    }

    return false;
}
