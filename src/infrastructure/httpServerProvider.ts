import { ILogger } from "../interfaces/ilogger";
const express = require('express');
const bodyParser = require('body-parser');

export class HttpServerProvider {
    server = express();

    constructor(private port: number, private l: ILogger) {
    }

    async start(): Promise<any> {
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.raw());
        this.server.use(bodyParser.text());

        try {
            this.server.listen(this.port, async () =>
                await this.l.log(`HTTP Server is listening on port ${this.port}`));
        }
        catch (err) {
            await this.l.log(err);
            return null;
        }

        return this.server;
    }
}
