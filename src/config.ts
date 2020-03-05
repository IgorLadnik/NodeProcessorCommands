export class Config {
    // PROCESSOR CONFIGURATION - MANDATORY
    // Logging
    static readonly loggerFilePath = 'infrastructure/logger';  // *.ts file

    // Commands
    static readonly commandsDir: string = 'commands';
    static readonly processorBootstrapCommandName: string = 'cmdBootstrap';

    // Versioning
    static readonly versionMin = 1;
    static readonly versionMax = 1;

    // Publish / Consume support
    //static readonly messageBrokerFactoryFilePath = ''; // empty when Publish / Consume not supported
    static readonly messageBrokerFactoryFilePath = 'infrastructure/rabbitmqProvider';  // *.ts file
    static readonly queueNames = ['il-01', 'il-02'];

    // CUSTOM CONFIGURATION
    // Resources config.
    static readonly sqlServer: string = 'IGORMAIN\\MSSQLSERVER01';
    static readonly sqlDatabase: string = 'PetsDb';
    static readonly port: number = 19019;
}

//
