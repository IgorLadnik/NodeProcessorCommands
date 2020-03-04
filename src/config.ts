import {SqlServerProvider} from "./infrastructure/sqlServerProvider";

export class Config {
    // Mandatory  config.
    static readonly commandsDir: string = 'commands';
    static readonly loggerFilePath = 'infrastructure/logger';  // *.ts file
    static readonly messageBrokerFactoryFilePath = 'infrastructure/rabbitmqProvider';  // *.ts file
    static readonly processorBootstrapCommandName: string = 'cmdBootstrap';
    static readonly versionMin = 1;
    static readonly versionMax = 1;

    // Resources config.
    static readonly queueNames = ['il-01', 'il-02'];
    static readonly sqlServer: string = 'IGORMAIN\\MSSQLSERVER01';
    static readonly sqlDatabase: string = 'PetsDb';
    static readonly port: number = 19019;
}
