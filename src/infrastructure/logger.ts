import { ILogger } from "../interfaces/ilogger";

export function create(): ILogger { return new Logger(); }

class Logger implements ILogger {
    static readonly prefix = '* ';

    log = async (msg: string): Promise<void> => 
        new Promise<void>(resolve =>
            setImmediate(() => {
                resolve();
                //console.debug(`${Logger.prefix}${msg}`);
                console.log(`${Logger.prefix}${msg}`);
            })
        );
}
