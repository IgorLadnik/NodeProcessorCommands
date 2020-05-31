import { ILogger } from "../interfaces/ilogger";
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const bodyParser = require('body-parser');

export class HttpOpenApiServerProvider {
    server = express();

    constructor(public apiDoc: any, public readonly rootDir: string, private readonly port: number, private readonly l: ILogger) {
        this.rootDir = rootDir;
    }

    async start(): Promise<boolean> {
        this.server.use(cors());
        this.server.use(bodyParser.json());
        this.server.use(express.json());

        this.server.use(this.rootDir, swaggerUi.serve, swaggerUi.setup(this.apiDoc));

        try {
            await this.server.listen(this.port);
        }
        catch (err) {
            await this.l.log(`Error in \"HttpOpenApiServerProvider.start()\": ${err}`);
            return false;
        }

        await this.l.log(`HttpOpenApiServer is listening on port ${this.port}`);
        return true;
    }
}
