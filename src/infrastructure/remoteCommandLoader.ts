import { ILogger } from "../interfaces/ilogger";
const urlJoin = require('url-join');
const requireFromUrl = require('require-from-url/sync');

export class RemoteCommandLoader {
    constructor(private readonly baseUrl: string, private readonly l: ILogger) { }

    async import(remoteCodeName: string, ...args: Array<string>): Promise<Function> {
        let fnCommand: Function;
        let url = urlJoin(this.baseUrl, remoteCodeName);

        try {
            fnCommand = (await requireFromUrl(url)).command;
        }
        catch (err) {
            this.l.log(`*** ERROR: ${err}`);
            return new Function();
        }

        return fnCommand;
    }
}
