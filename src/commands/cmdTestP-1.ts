export async function command(args: any, p: any, message: any): Promise<boolean> {
    const thisCommandName = 'cmdTestP';
    let logger = p.getLogger();

    const Utils = (await import(`${p.workingDir}/infrastructure/utils`)).Utils;

    /*await*/ logger.log(`${thisCommandName}: Started. args: ${JSON.stringify(args)}`);
    let str = !message.isEmpty ? `| message: ${message}` : '';
    await Utils.delay(100, logger);
    /*await*/ logger.log(`${thisCommandName}: Ended. args: ${JSON.stringify(args)} ${str}`);
    return true;
}
