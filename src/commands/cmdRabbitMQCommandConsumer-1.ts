import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor, message: any): Promise<boolean> {
    const thisCommandName = 'cmdRabbitMQCommandConsumer';
    let logger = p.getLogger();

    /*await*/ logger.log(`Command ${thisCommandName} started  args: ${JSON.stringify(args)} ${!message.isEmpty ? `, message: ${message}` : ''}`);

    const Config = (await import(`${p.workingDir}/config`)).Config;
    const _ = await import(`${p.stdImportDir}/lodash`);
    const Consumer = (await import(`${p.stdImportDir}/rabbitmq-provider/consumer`)).Consumer;
    
    const consumer = await Consumer.createConsumer(Config.messageBroker, logger,
                            (thisConsumer: any, msg: any) => p.getCommandFromQueueMessageAndExecute(msg));
    p.setResource('consumer', consumer);

    /*await*/ logger.log(`Command ${thisCommandName} ended`);
    
    return true;
}
