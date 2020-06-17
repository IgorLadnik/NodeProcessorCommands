import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor, message: any): Promise<boolean> {
    const thisCommandName = 'cmdHttpClientSample';
    let logger = p.getLogger();

    await logger.log(`Command ${thisCommandName} started  args: ${JSON.stringify(args)} ${!message.isEmpty ? `, message: ${message}` : ''}`);
    
    // Currently available local dependencies. Please remove not used.
    const request = await import(`${p.stdImportDir}/request`);

    request.get('http://localhost:19020/v1/pets/55', { json: true }, async (err: any, resp: any, body: any) => {
        if (err)
            await logger.log(`Error in command \"${thisCommandName}\": ${err}`);
        else
            logger.log(`Command ${thisCommandName}: ${JSON.stringify(body)}`);
    });

    request.post('http://localhost:19020/v1/pets?name=Murka', { json: true }, async (err: any, resp: any, body: any) => {
        if (err)
            await logger.log(`Error in command \"${thisCommandName}\": ${err}`);
        else
            logger.log(`Command ${thisCommandName}: ${JSON.stringify(body)}`);
    });

    await logger.log(`Command ${thisCommandName} ended`);
    
    return true;
}
