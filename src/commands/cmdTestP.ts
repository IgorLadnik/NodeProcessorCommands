import { ItemInfo } from '../models/itemInfo';

export async function executeCommand(args: any, resources: any, itemInfo: ItemInfo): Promise<any> {
    const thisCommandName = 'cmdTestP';
    console.log(`${thisCommandName}: args: ${JSON.stringify(args)} | itemInfo: ${JSON.stringify(itemInfo)}`);

    return resources;
}
