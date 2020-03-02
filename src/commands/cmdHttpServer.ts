import { ItemInfo } from '../models/itemInfo';
import { IProcessor } from "../processor/iprocessor";
const express = require('express');
import { HttpServerProvider } from '../infrastructure/httpServerProvider';

export async function executeCommand(args: any, processor: IProcessor, itemInfo: ItemInfo): Promise<void> {
    const thisCommandName = 'cmdHttpServer';
    let l = processor.getResource('logger');

    const httpServer = new HttpServerProvider(l).server;
    const port = 19019;
    l.log(`${thisCommandName}: port = ${port}`);

    httpServer.get('/', (req: any, res: any) => {
        try {
            res.send('Hello World!');
        }
        catch (err) {
            l.log(err);
        }
    });
}
