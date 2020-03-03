import {SqlServerProvider} from "./infrastructure/sqlServerProvider";

export class Config {
    static commandsDir: string = 'commands';
    static processorBootstrapCommandName: string = 'cmdBootstrap';
    static versionMin = 1;
    static versionMax = 1;
    static sqlServer: string = 'IGORMAIN\\MSSQLSERVER01';
    static sqlDatabase: string = 'PetsDb';
    static port: number = 15015;
}
