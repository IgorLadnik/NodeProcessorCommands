import {SqlServerProvider} from "./infrastructure/sqlServerProvider";

export class Config {
    static commandsDir: string = '../commands/';
    static processorBootstrapCommandName: string = 'cmdBootstrap';
    static sqlServer: string = 'IGORMAIN\\MSSQLSERVER01';
    static sqlDatabase: string = 'PetsDb';
    static port: number = 15015;
}