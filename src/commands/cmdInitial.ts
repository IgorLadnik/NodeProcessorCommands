import { CommandInfo } from '../models/commandInfo';
import { ItemInfo } from '../models/itemInfo';

export async function executeCommand(args: any, resources: any, itemInfo: ItemInfo, callback: any): Promise<any> {
    console.log('cmdInitial');

    let p = resources.processor;

    setTimeout(() =>
        p.publishMany(p.getQueueNames()[0],
            [
                new CommandInfo('cmdFirst', {a: 'aaa', n: 1}),
                new CommandInfo('cmdFirst', {a: 'qqq', n: 1})
            ],
        false),
    1000);

    setInterval(() =>
        p.publishMany(p.getQueueNames()[0],
            [
                new CommandInfo('cmdTestP', {order: 1}),
                new CommandInfo('cmdTestP', {order: 2}),
                new CommandInfo('cmdTestP', {order: 3})
            ], false),
    370);

    let updatedResources =  await callback(new CommandInfo('cmdHttpServer'), resources);

    return updatedResources;
}
