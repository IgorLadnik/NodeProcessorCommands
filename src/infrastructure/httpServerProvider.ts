import { ILogger } from "./ilogger";
const express = require('express');

export class HttpServerProvider {
    port = 19019;
    server = express();

    constructor(l: ILogger) {
        try {
            this.server.listen(this.port, () =>
                l.log(`HTTP Server is listening on port ${this.port}`));
        } catch (err) {
            l.log(err);
        }
    }
}
