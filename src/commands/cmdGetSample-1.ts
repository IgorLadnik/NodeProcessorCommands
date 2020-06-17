import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor, message: any): Promise<boolean> {
    const thisCommandName = 'cmdGetSample';
    let logger = p.getLogger();

    const _ = await import(`${p.stdImportDir}/lodash`);
    const Command = (await import(`${p.workingDir}/models/command`)).Command;

    let sql = p.getResource('sql');
    if (_.isNil(sql)) {
        await p.execute(new Command('cmdSqlConnect'));
        sql = p.getResource('sql');
    }

    if (_.isNil(sql))
        return false;

    let recordset = await sql.simpleQuery(args.select, args.from);
    p.setResource('recordset', recordset);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    logger.log(`${thisCommandName}: args: ${JSON.stringify(args)} ${str}`);

    return true;
}



