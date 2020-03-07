export class Config {
    // PROCESSOR CONFIGURATION - MANDATORY

    static readonly logger = {
        filePath: 'infrastructure/logger'  // *.ts file
    };

    static readonly commandSets = [{
        dir: 'commands',
        bootstrapCommandName: 'cmdBootstrap'
    }];

    static readonly versions = {
        min: 1,
        max: 1
    };

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
        ports: [19019]
    };
}


