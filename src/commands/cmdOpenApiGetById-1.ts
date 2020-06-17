import { IProcessor } from '../interfaces/iprocessor';

export async function command(args: any, p: IProcessor): Promise<boolean> {
    const thisCommandName = 'cmdOpenApiGetById';
    let logger = p.getLogger();
    let httpOpenApiServerProvider = args;
    const dir = `${httpOpenApiServerProvider.rootDir}/pets/`;

    httpOpenApiServerProvider.apiDoc.paths[`${dir}{id}`] = {
        get: {
            operationId: 'getPetById',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    description: 'ID of pet to fetch',
                    required: true,
                    schema: {
                        type: 'integer',
                        format: 'int64'
                    }
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

    httpOpenApiServerProvider.server.get(`${dir}:id`, (req: any, res: any) => {
        res.json({id: req.params.id, name: 'Malysh'});
        logger.log(`${thisCommandName}:`);
    });

    return true;
}
