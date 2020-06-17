import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor, message: any): Promise<boolean> {
    const thisCommandName = 'cmdTestP';
    let logger = p.getLogger();

    const Utils = (await import(`${p.workingDir}/infrastructure/utils`)).Utils;

    /*await*/ logger.log(`${thisCommandName}: Started. args: ${JSON.stringify(args)}`);
    let str = !message.isEmpty ? `| message: ${JSON.stringify(args)}` : '';
    await Utils.delay(100, logger);
    /*await*/ logger.log(`${thisCommandName}: Ended. args: ${JSON.stringify(args)} ${str}`);
    return true;
}
