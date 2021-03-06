import { ILogger } from "../interfaces/ilogger";

export class CommandFunctionWrapper {
    constructor(private fn: Function, private readonly l: ILogger) { }

    async call(...args: Array<any>): Promise<boolean> {
        try {
            return await this.fn(...args);
        }
        catch (err) {
            await this.l.log(`Error in command function execution: ${err}`);
            return false;
        }
    }
}

