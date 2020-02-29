import { CommandInfo } from '../models/commandInfo';
import { ItemInfo } from '../models/itemInfo';
import { Publisher } from '../infrastructure/rabbitmqProvider';

/*
Parameters
    args: any - any data created by publisher

    resources: any - external resources injected by processor
                     (e.g. data about RabbitMQ publishers, database provider, etc.)

    itemImfo: ItemInfo - information about source item out of which the command was constructed.
                         Currently contains data about RabbitMQ message (item)

    callback: any - processor's method
                    static async getAndExecuteCommand(commandInfo: CommandInfo, resources: any,
                                                      itemInfo: any = undefined): Promise<any>
                    It is called when a different command should be executed immediately
                    without queueing in context of current service.
                    Its useful when additional resources should be added to the service,
                    e.g. database connection.
 */
export async function executeCommand(args: any, resources: any, itemInfo: ItemInfo, callback: any): Promise<any> {
    const thisCommandName = 'cmdTemplate';

    let isResourceAvailable = false;
    try {
        // Some business logic
        isResourceAvailable = true;
    }
    catch (err) {
        console.log(err);
    }

    let updatedResources = resources;
    if (!isResourceAvailable) {
        // Execute command to create the resource and update resources of the processor
        let argsIfRequired = '...';
        updatedResources = await callback(new CommandInfo('cmdRecourceMaker', argsIfRequired), resources);
    }

    // Some more business logic

    // Create and enqueue new command, if required, sync...
    createAndEnqueueNewCommand(updatedResources);

    // ... of async
    setTimeout(() => createAndEnqueueNewCommand(updatedResources), 1000);

    return updatedResources;
}

function createAndEnqueueNewCommand(resorces: any) {
    let queueName = '...';
    let newCommandName = 'cmd...';
    let newCommandArgs =  { arg0: 'arg0', arg1: 'arg1' };
    let publisher: Publisher = resorces.publishers.get(queueName);
    publisher.publish<CommandInfo>(queueName, new CommandInfo(newCommandName, newCommandArgs));
}
