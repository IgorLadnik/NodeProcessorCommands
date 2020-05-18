import { ILogger } from "../interfaces/ilogger";
const express = require('express');
const bodyParser = require('body-parser');

export class HttpServerProvider {
    server = express();
    
    constructor(port: number, l: ILogger) {
        this.server.use(bodyParser.urlencoded({ extended: true }));
        this.server.use(bodyParser.json());
        this.server.use(bodyParser.raw());
        this.server.use(bodyParser.text());

        try {
            this.server.listen(port, () =>
                l.log(`HTTP Server is listening on port ${port}`));
        } 
        catch (err) {
            l.log(err);
        }
    }
}
