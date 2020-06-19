export class Config {

    static isRunStandAlone = false; // false to run with RabbitMQ and SQL Server

    // PROCESSOR CONFIGURATION

    static readonly logger = {
        filePath: 'infrastructure/logger'  // *.ts file
    };

    static repoUrl: string;

    static readonly commandSets = [{
        repoUrl: Config.isRunStandAlone ? '' : 'http://localhost:9000',
        dir: 'commands',
        bootstrapCommandName: 'cmdBootstrap'
    }];

    static readonly versions = {
        min: 1,
        max: 1
    };

    // COMMANDS RELATED CONFIGURATION

    static httpServer: any;
    static messageBroker: any;
    static sqlServer: any;

    static createConfig() {
        if (Config.isRunStandAlone) {
            Config.repoUrl = '';

            Config.httpServer = {
                ports: [-1, 19020]
            };
        }
        else {
            // Message broker (queueing) support is an optional. RabbitMQ is used as message broker in this project,
            // but other MQs may be used in stead since Publisher and Consumer are used through their interfaces.
            Config.messageBroker = {
                //connUrl: 'amqp://guest:1237@localhost:5672', //`amqp://${user}${password}${host}:${port}`,
                host: 'localhost',
                port: 5672,
                user: 'guest',
                password: '1237',
                queue: 'test-queue'
            };

            Config.sqlServer = {
                host: 'IGORMAIN\\MSSQLSERVER01',
                databases: ['PetsDb']
            };

            Config.httpServer = {
                ports: [19019, 19020]
            };
        }
    }
}


