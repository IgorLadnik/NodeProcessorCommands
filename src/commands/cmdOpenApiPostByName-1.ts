export async function command(args: any, p: any): Promise<boolean> {
    const thisCommandName = 'cmdOpenApiPostByName';
    let logger = p.getLogger();
    let httpOpenApiServerProvider = args;

    const dir = `${httpOpenApiServerProvider.rootDir}/pets`;

    httpOpenApiServerProvider.apiDoc.paths[`${dir}`] = {
        post: {
            operationId: 'postPetByName',
            parameters: [
                {
                    name: 'name',
                    in: 'query',
                    description: 'Name of pet to fetch',
                    required: true,
                    schema: { type: 'string' }
                }
            ],
            responses: {
                200: {
                    description: 'pet response',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Pet'
                            }
                        }
                    }
                },
                default: {
                    description: 'unexpected error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    };

    httpOpenApiServerProvider.server.post(`${dir}`, async (req: any, res: any) => {
        res.json({id: 139, name: req.query.name});
        await logger.log(`${thisCommandName}:`);
    });

    return true;
}
