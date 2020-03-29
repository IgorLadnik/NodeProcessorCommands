export class Config {
    // PROCESSOR CONFIGURATION - MANDATORY

    static readonly logger = {
        filePath: 'infrastructure/logger'  // *.ts file
    };

    static readonly commandSets = [{
        //repo: 'http://localhost:9000',
        dir: '/commands/',
        bootstrapCommandName: 'cmdBootstrap'
    }];

    static readonly versions = {
        min: 1,
        max: 1
    };

    // Message broker (queueing) support is an optional. RabbitMQ is used as message broker in this project,
    // but other MQs may be used in stead since Publisher and Consumer are used through their interfaces.
    static readonly messageBroker = {
        factoryFilePath: 'infrastructure/rabbitmqProvider',  // *.ts file
        queueNames: ['il-01', 'il-02']
    };


    // CUSTOM CONFIGURATION (for commands)

    static readonly sqlServer = {
        host: 'IGORMAIN\\MSSQLSERVER01',
        databases: ['PetsDb']
    };

    static readonly httpServer = {
        ports: [19019, 19020]
    };
}


