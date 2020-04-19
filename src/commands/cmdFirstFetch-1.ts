export async function command(args: any, p: any, message: any): Promise<boolean> {
    const thisCommandName = 'cmdFirstFetch';
    let logger = p.getLogger();

    const _ = await import(`${p.stdImportDir}/lodash`);
    let sql = p.getResource('sql');
    if (_.isNil(sql))
        return false;

    const dbTable = 'Pets';
    let recordset = new Array<any>();
    try {
        recordset = await sql.simpleQuery('*', dbTable);
    }
    catch (err) {
        logger.log(`Error in command \"${thisCommandName}\": failed to execute query to table \"${dbTable}\"`);
        return false;
    }

    p.setResource('recordset', recordset);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} ${str}`);

    return true;
}
