import { ILogger } from "../interfaces/ilogger";

export function create(): ILogger { return new Logger(); }

class Logger implements ILogger {
    log(msg: string): void {
        console.log(`* ${msg}`);
    }
}