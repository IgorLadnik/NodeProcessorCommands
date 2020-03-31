/*
This template to crete new commands.

In the command signature:
    args: any      - command's arguments provided by calller.
    p: any         - processor. Its actual type is IProcessor.
    message: any   - contains info of message if command was creted on some message erceived (from message queue or other sources)
                     Usually is not used.
*/
export async function command(args: any, p: any, message: any): Promise<boolean> {
    const thisCommandName = 'cmdTemplate';
    let logger = p.getLogger();

    logger.log(`Command ${thisCommandName} started  args: ${JSON.stringify(args)} ${!message.isEmpty ? `, message: ${message}` : ''}`);
    
    // Currently available local dependencies. Please remove not used.
    const Utils = (await import(`${p.workingDir}/infrastructure/utils`)).Utils;
    const Config = (await import(`${p.workingDir}/config`)).Config;
    const Command = (await import(`${p.workingDir}/models/command`)).Command;
    const HttpServerProvider = (await import(`${p.workingDir}/infrastructure/httpServerProvider`)).HttpServerProvider;
    const HttpOpenApiServerProvider = (await import(`${p.workingDir}/infrastructure/httpOpenApiServerProvider`)).HttpOpenApiServerProvider;
    const SqlServerProvider = (await import(`${p.workingDir}/infrastructure/SqlServerProvider`)).SqlServerProvider;
    
    // Provide business logic here

    logger.log(`Command ${thisCommandName} ended`);
    
    return true;
}
