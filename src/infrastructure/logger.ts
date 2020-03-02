import { ILogger } from "./ilogger";

export class Logger implements ILogger {
    log(msg: string): void {
        console.log(`* ${msg}`);
}
}