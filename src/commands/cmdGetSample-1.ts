export async function command(args: any, p: any, message: any): Promise<boolean> {
    const thisCommandName = 'cmdGetSample';
    let logger = p.getLogger();

    const Command = require(p.getWorkingDir() + '/models/command').Command;
    const Utils = require(p.getWorkingDir() + '/infrastructure/utils').Utils;

    let sql = p.getResource('sql');
    if (!Utils.isValid(sql)) {
        await p.execute(new Command('cmdSqlConnect'));
        sql = p.getResource('sql');
    }

    if (!Utils.isValid(sql))
        return false;

    let recordset = await sql.simpleQuery(args.select, args.from);
    p.setResource('recordset', recordset);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} ${str}`);

    return true;
}



