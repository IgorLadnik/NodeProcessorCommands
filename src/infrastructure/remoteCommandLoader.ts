import { ILogger } from "../interfaces/ilogger";
import fetch from 'node-fetch';
const requireFromUrl = require('require-from-url/sync');
const Module = require('module');
const urlJoin = require('url-join');

export class RemoteCommandLoader {
    constructor(private readonly baseUrl: string, private readonly l: ILogger) { }

    async importCommand1(remoteCodeName: string): Promise<Function> {
        let fnCommand: Function;
        let url = urlJoin(this.baseUrl, remoteCodeName);

        try {
            fnCommand = await requireFromUrl(url).command;
        }
        catch (err) {
            this.l.log(`Error in requireFromUrl \"${url}\": ${err}, stack: ${err.stack}`);
            return new Function();
        }

        return fnCommand;
    }

    async importCommand2(remoteCodeName: string): Promise<Function> {
        let url = urlJoin(this.baseUrl, remoteCodeName);
        let script = await fetch(url);
        if (!script.ok) {
            this.l.log(`Error in fetching module from  \"${url}\"`);
            return new Function();
        }

        let m = new Module();

        try {
            m._compile(await script.text(), '');
        }
        catch (err) {
            this.l.log(`Error in compiling module fetched from \"${url}\": ${err}, stack: ${err.stack}`);
        }

        return m.exports.command;
    }
}
