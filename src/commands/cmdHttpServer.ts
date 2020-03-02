import { ItemInfo } from '../models/itemInfo';
import {IProcessor} from "../processor/iprocessor";
const express = require('express');

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    const thisCommandName = 'cmdHttpServer';

    const httpServer = express();
    const port = 19019;
    console.log(`${thisCommandName}: port = ${port}`);

    httpServer.get('/', (req: any, res: any) => {
        try {
            res.send('Hello World!');
        }
        catch (err) {
            console.log(err);
        }
    });

    try {
        httpServer.listen(port, () => console.log(`HTTP Server is listening on port ${port}`));
        processor.addResource('httpServer', httpServer);
    }
    catch (err) {
        console.log(err);
    }
}
