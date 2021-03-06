export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdCreateHttpOpenApiServer';
    let logger = p.getLogger();

    const Command = (await import(`${p.workingDir}/models/command`)).Command;
    const HttpOpenApiServerProvider = (await import(`${p.workingDir}/infrastructure/httpOpenApiServerProvider`)).HttpOpenApiServerProvider;

    const port = args as number;
    const rootDir = '/v1';

    let apiDoc: any = {
        openapi: '3.0.0',
        info: {
            title: 'Swagger',
            description: 'bla-bla',
            version: '1.0.0',
        },
        tags: [{name: 'pet'}],
        paths: {},
        components: {
            schemas: {
                Pet: {
                    required: ['name'],
                    properties: {
                        'name': {type: 'string'}
                    }
                },
                Error: {
                    required: ['code', 'message'],
                    properties: {
                        code: {
                            type: 'integer',
                            format: 'int64'
                        },
                        message: {
                            type: 'string'
                        }
                    }
                }
            }
        }
    };

    const httpOpenApiServerProvider = new HttpOpenApiServerProvider(apiDoc, rootDir, port, logger);

    //let br = await p.executeParallel(new Command('cmdOpenApi*', httpOpenApiServerProvider));
    let br = await p.executeParallel(new Command('cmdOpenApiGetById', httpOpenApiServerProvider),
                                     new Command('cmdOpenApiPostByName', httpOpenApiServerProvider));
    if (br)
        br = await httpOpenApiServerProvider.start();

    return br;
}
