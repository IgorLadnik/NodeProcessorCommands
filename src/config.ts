import {SqlServerProvider} from "./infrastructure/sqlServerProvider";

export class Config {
    static commandsDir: string = '../commands/';
    static sqlServer: string = 'IGORMAIN\\MSSQLSERVER01';
    static sqlDatabase: string = 'PetsDb';
    static port: number = 19019;
}