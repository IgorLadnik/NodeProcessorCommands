import { ILogger } from "../interfaces/ilogger";
const urlJoin = require('url-join');
const requireFromUrl = require('require-from-url/sync');

export class RemoteCommandLoader {
    constructor(private readonly baseUrl: string, private readonly l: ILogger) { }

    import(remoteCodeName: string, ...args: Array<string>): Function {
        let fnCommand: Function;
        let url = urlJoin(this.baseUrl, remoteCodeName);

        try {
            fnCommand = requireFromUrl(url).command;
        }
        catch (err) {
            this.l.log(`Error in requireFromUrl \"${url}\": ${err}, stack: ${err.stack}`);
            return new Function();
        }

        return fnCommand;
    }
}
