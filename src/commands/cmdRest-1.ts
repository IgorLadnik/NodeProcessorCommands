export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdRest';
    let logger = p.getLogger();

    const Command = (await import(`${p.workingDir}/models/command`)).Command;
    const Utils = (await import(`${p.workingDir}/infrastructure/utils`)).Utils;

    let httpServer = args;
    if (!Utils.isValid(httpServer)) {
        logger.log(`Error in command \"${thisCommandName}\" http server is not available`);
        return false;
    }

    logger.log(`Command \"${thisCommandName}\" http GET on root created`);
    httpServer.get('/', async (req: any, res: any) => {
        await p.execute(new Command('cmdGetSample', {select: '*', from: 'Pets'}));

        let recordset = p.getResource('recordset');
        if (recordset) {
            p.deleteResource('recordset');
            try {
                res.send(`Hello World! ${JSON.stringify(recordset)}`);
            } catch (err) {
                logger.log(err);
            }
        }
    });

    return true;
}
