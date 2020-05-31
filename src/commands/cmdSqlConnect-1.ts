export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdSqlConnect';
    let logger = p.getLogger();
    /*await*/ logger.log(`cmdSqlConnect: args: ${JSON.stringify(args)}`);

    const _ = await import(`${p.stdImportDir}/lodash`);
    const SqlServerProvider = (await import(`${p.workingDir}/infrastructure/SqlServerProvider`)).SqlServerProvider;
    const Config = (await import(`${p.workingDir}/config`)).Config;

    if (_.isNil(Config.sqlServer)) {
        await logger.log(`${thisCommandName}: configuration for SQL Server is not defined`);
        return true;
    }

    let server = Config.sqlServer.host;
    let database = Config.sqlServer.databases[0];
    let sql = new SqlServerProvider({server, database}, logger);
    try {
        await sql.connect();
        p.setResource('sql', sql);
        return true;
    }
    catch (err) {
        await logger.log(err);
        return false;
    }
}

