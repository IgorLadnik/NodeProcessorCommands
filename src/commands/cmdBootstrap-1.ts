export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdBootstrap';
    let logger = p.getLogger();
    logger.log(thisCommandName);

    //const Command = require(`${p.workingDir}/models/command`).Command;
    //const Config = require(`${p.workingDir}/config`).Config;
    const Command = (await import(`${p.workingDir}/models/command`)).Command;
    const Config = (await import(`${p.workingDir}/config`)).Config;

    let br = await p.execute(new Command('cmdCreateHttpServer', Config.httpServer.ports[0]));

    if (br)
        br = await p.execute(new Command('cmdCreateHttpOpenApiServer', Config.httpServer.ports[1]));

    if (br) {
        br = false;
        let commandFirstFetch = new Command('cmdFirstFetch', {a: 'aaa', n: 1});
        if (!await p.execute(commandFirstFetch))
            if (await p.execute(new Command('cmdSqlConnect')))
                br = await p.execute(commandFirstFetch);
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


