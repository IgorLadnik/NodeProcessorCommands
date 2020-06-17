import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor): Promise<boolean> {
    const thisCommandName = 'cmdRestPost';
    let logger = p.getLogger();

    const _ = await import(`${p.stdImportDir}/lodash`);

    let httpServer = args;
    if (_.isNil(httpServer)) {
        await logger.log(`Error in command \"${thisCommandName}\" http server is not available`);
        return false;
    }

    await logger.log(`Command \"${thisCommandName}\" http POST on root created`);
    httpServer.post('/p', (req: any, res: any) => {
        const str = req.body;
        const queryName = req.query.name;

        // await p.execute(new Command('cmdGetSample', {select: '*', from: 'Pets'}));

        // let recordset = p.getResource('recordset');
        // if (recordset) {
        //     p.deleteResource('recordset');
        //     try {
        //         res.send(`Hello World! ${JSON.stringify(recordset)}`);
        //     } 
        //     catch (err) {
        //         logger.log(err);
        //     }
        // }
    });

    return true;
}
