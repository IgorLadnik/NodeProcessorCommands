import { ItemInfo } from '../models/itemInfo';
const express = require('express');

export async function executeCommand(args: any, resources: any, itemInfo: ItemInfo, callback: any): Promise<any> {
    const thisCommandName = 'cmdHttpServer';

    const server = express();
    const port = 19019;
    console.log(`${thisCommandName}: port = ${port}`);

    let updatedResources = resources;
    server.get('/', (req: any, res: any) => {
        try {
            res.send('Hello World!')
        }
        catch (err) {
            console.log(err);
        }
    });

    try {
        server.listen(port, () => console.log(`HTTP Server is listening on port ${port}`));
        updatedResources.httpServer = server;
    }
    catch (err) {
        console.log(err);
    }

    return updatedResources;
}
