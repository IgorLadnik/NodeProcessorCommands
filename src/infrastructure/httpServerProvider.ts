import { ILogger } from "../interfaces/ilogger";
const express = require('express');

export class HttpServerProvider {
    server = express();

    constructor(port: number, l: ILogger) {
        try {
            this.server.listen(port, () =>
                l.log(`HTTP Server is listening on port ${port}`));
        } catch (err) {
            l.log(err);
        }
    }
}
