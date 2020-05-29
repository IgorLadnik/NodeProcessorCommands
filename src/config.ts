export class Config {

    static isRunStandAlone = false; // false to run with RabbitMQ and SQL Server

    // PROCESSOR CONFIGURATION

    static readonly logger = {
        filePath: 'infrastructure/logger'  // *.ts file
    };

    static repoUrl: string;

    static readonly commandSets = [{
        repoUrl: Config.repoUrl,
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
            Config.repoUrl = 'http://localhost:9000';

            // Message broker (queueing) support is an optional. RabbitMQ is used as message broker in this project,
            // but other MQs may be used in stead since Publisher and Consumer are used through their interfaces.
            Config.messageBroker = {
                connUrl: 'amqp://guest:1237@localhost:5672',
                factoryFilePath: 'infrastructure/rabbitmqProvider',  // *.ts file
                queueNames: ['il-01', 'il-02']
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


