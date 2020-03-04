import { ILogger } from "../interfaces/ilogger";

export function createLogger(): ILogger { return new Logger(); }

class Logger implements ILogger {
    log(msg: string): void {
        console.log(`* ${msg}`);
    }
}