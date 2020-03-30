export async function command(args: any, p: any, message: any): Promise<boolean> {
    const thisCommandName = 'cmdTestP';
    let logger = p.getLogger();

    const Utils = require(p.getWorkingDir() + '/infrastructure/utils').Utils;

    logger.log(`${thisCommandName}: Started`);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    await Utils.delay(100, logger);
    logger.log(`${thisCommandName}: Ended. args: ${JSON.stringify(args)} ${str}`);
    return true;
}
