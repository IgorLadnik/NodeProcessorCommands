export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdSqlInit';
    let logger = p.getLogger();
    await logger.log(`cmdSqlInit: args: ${JSON.stringify(args)}`);

    const _ = await import(`${p.stdImportDir}/lodash`);
    const SqlServerProvider = (await import(`${p.workingDir}/infrastructure/sqlServerProvider`)).SqlServerProvider;
    const Config = (await import(`${p.workingDir}/config`)).Config;

    if (_.isNil(Config.sqlServer)) {
        await logger.log(`${thisCommandName}: configuration for SQL Server is not defined`);
        return true;
    }

    try {
        p.setResource('sql', new SqlServerProvider({
            server: Config.sqlServer.host,
            database: Config.sqlServer.databases[0]
        },
        logger));

        return true;
    }
    catch (err) {
        await logger.log(err);
        return false;
    }
}

