import { RemoteCommandLoader } from "../infrastructure/remoteCommandLoader";
import * as child_process from 'child_process';

export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdBootstrap';
    let logger = p.getLogger();
    logger.log(thisCommandName);

    //const Command = (await import(`${p.workingDir}/models/command`)).Command;
    //const Config = (await import(`${p.workingDir}/config`)).Config;
    const Command = require(`${p.workingDir}/models/command`).Command;
    const Config = require(`${p.workingDir}/config`).Config;

    // let buffer = child_process.execSync('npm install express');
    // const express = require('express');
    // const app = express();

    let br0 = await p.execute(new Command('cmdCreateHttpServer', Config.httpServer.ports[0]));

    let br = await p.execute(new Command('cmdCreateHttpOpenApiServer', Config.httpServer.ports[1]));

    logger.log('before fork cmdTestP 1001');
    p.executeFork(1000, new Command('cmdTestP', {order: 1001}),
                                  new Command('cmdTestP', {order: 1002}));
    logger.log('after fork cmdTestP 1001');

    logger.log('before fork parallel cmdTestP 2001');
    p.executeForkParallel(1000, new Command('cmdTestP', {order: 2001}),
                                          new Command('cmdTestP', {order: 2002}));
    logger.log('after fork parallel cmdTestP 2002');

    if (br) {
        let commandFirstFetch = new Command('cmdFirstFetch', {a: 'aaa', n: 1});
        if (!await p.execute(commandFirstFetch))
            if (await p.execute(new Command('cmdSqlConnect')))
                await p.execute(commandFirstFetch);
    }

    if (br)
        br = await p.executeParallel(
            new Command('cmdTestP', {order: 1}),
            new Command('cmdTestP', {order: 2}),
            new Command('cmdTestP', {order: 3}));

    if (br)
        br = await p.execute(
            new Command('cmdTestP', {order: 1}),
            new Command('cmdTestP', {order: 2}),
            new Command('cmdTestP', {order: 3}));

    if (br && p.isMessageBrokerSupported()) {
        setInterval(async () =>
                await p.publish(p.getQueueNames()[0],
                    new Command('cmdFirstFetch', {a: 'aaa', n: 1}),
                    new Command('cmdFirstFetch', {a: 'qqq', n: 1})),
            3000);

        setInterval(async () =>
                await p.publishParallel(p.getQueueNames()[0],
                    new Command('cmdTestP', {order: 1}),
                    new Command('cmdTestP', {order: 2}),
                    new Command('cmdTestP', {order: 3})),
            1370);
    }

    return br;
}


