import { IProcessor } from '../interfaces/iprocessor';
import { ILogger } from '../interfaces/ilogger';
import { Dictionary } from 'dictionaryjs';
import { CommandInfo } from '../models/commandinfo';
import { MessageInfo } from '../models/messageInfo';
import { Config } from '../config';
import { IMessageBrokerFactory, IPublisher, IConsumer } from '../interfaces/messageInterfaces';
import { v4 as uuidv4 } from 'uuid';
const fs = require('fs');

export class Processor implements IProcessor {
    private readonly id: string;
    private readonly parallelCmdName = '';
    private readonly commandsDir: string;
    private processorBootstrapCommandName = Config.processorBootstrapCommandName;

    private readonly commands = new Dictionary<string, any>();
    private readonly queueNames: Array<string>;
    private readonly publishers = new Dictionary<string, IPublisher>();
    private readonly resources = new Dictionary<string, any>();
    private logger: ILogger;
    private messageBrokerFactory: IMessageBrokerFactory;
    private readonly commandNames = new Dictionary<string, string>();
    private readonly workingDir: string;

    private static defaultMessageInfo = new MessageInfo();

    constructor(workingDir: string) {
        this.id = `processor-${uuidv4()}`;
        this.workingDir = workingDir;
        this.commandsDir = `${this.workingDir}/${Config.commandsDir}/`;
        this.queueNames = Config.queueNames;
        this.createCommandFileLookup();
    }

    async init(): Promise<Processor> {
        this.messageBrokerFactory = (await import(`${this.workingDir}/${Config.messageBrokerFactoryFilePath}`)).create();
        this.logger = (await import(`${this.workingDir}/${Config.loggerFilePath}`)).create();
        await Promise.all([this.startConsumers(), this.createPublishers()]);
        await this.executeOne(new CommandInfo(this.processorBootstrapCommandName));
        return this;
    }


    // Implementation of IProcessor

    getId(): string {
        return this.id;
    }

    getLogger(): ILogger {
        return this.logger;
    }

    getQueueNames(): Array<string> {
        return this.queueNames;
    }

    getResource(resourceName: string): any {
        try {
            return this.resources.get(resourceName);
        }
        catch (err) {
            this.logger.log(`resource \"resourceName\" is not available`);
            return undefined;
        }
    }

    setResource(resourceName: string, resource: any): void {
        if (resource !== undefined)
            this.resources.set(resourceName, resource);
        else
            this.resources.remove(resourceName);
    }

    // Public execute commands methods

    async execute(...arrCommandInfo: Array<CommandInfo>): Promise<void> {
        for (let i = 0; i < arrCommandInfo.length; i++)
            await (this.executeOne(arrCommandInfo[i]));
    }

    async executeParallel(...arrCommandInfo: Array<CommandInfo>): Promise<void> {
        let promises = new Array<Promise<void>>();
        for (let i = 0; i < arrCommandInfo.length; i++)
            promises.push(this.executeOne(arrCommandInfo[i]));

        await Promise.all(promises);
    }

    // Publish methods

    async publish(queueName: string, ...arrCommandInfo: Array<CommandInfo>)
            : Promise<void> {
        await this.publishers.get(queueName).publish<CommandInfo>(queueName, arrCommandInfo, true);
    }

    async publishParallel(queueName: string, ...arrCommandInfo: Array<CommandInfo>)
            : Promise<void> {
        await this.publishOne(queueName, new CommandInfo(this.parallelCmdName, arrCommandInfo), true);
    }


    // Private methods

    private async executeOne(commandInfo: CommandInfo, messageInfo: MessageInfo = Processor.defaultMessageInfo)
                : Promise<void> {
        try {
            let command: any = this.commands.get(commandInfo.name);
            if (!command) {
                let actualCommandFileName = this.commandNames.get(commandInfo.name);
                if (actualCommandFileName) {
                    command = await import(actualCommandFileName);
                    this.commands.set(commandInfo.name, command);
                }
                else
                    this.logger.log(`Error: file for command \"${commandInfo.name}\" does not exists`);
            }

            if (command)
                await command.command(commandInfo.args, this as IProcessor, messageInfo);
        }
        catch (err) {
            this.logger.log(err);
        }
    }

    private async createPublishers(): Promise<void> {
        for (let i = 0; i < this.queueNames.length; i++)
            this.publishers.set(this.queueNames[i],
                await this.messageBrokerFactory.startPublisher(this.queueNames[i], this.logger, true));
    }

    private async startConsumers(): Promise<void> {
        let promises = new Array<Promise<IConsumer>>();
        for (let i = 0; i < this.queueNames.length; i++)
            promises.push(this.messageBrokerFactory.startConsumer(this.queueNames[i], this.logger,
                async (item: any) => await this.getCommandFromQueueMessageAndExecute(item)));
                    
        await Promise.all(promises);
    }

    private async publishOne(queueName: string, commandInfo: CommandInfo, persistent: boolean)
        : Promise<void> {
        await this.publishers.get(queueName).publishOne<CommandInfo>(queueName, commandInfo, persistent);
    }

    private async getCommandFromQueueMessageAndExecute(item: any): Promise<void> {
        let _ = item.fields;
        try {
            let messageInfo = new MessageInfo(_.exchange, _.routingKey, _.consumerTag, _.deliveryTag, _.redelivered);
            let commandInfo: CommandInfo = JSON.parse(item.content.toString());
            if (commandInfo.name === this.parallelCmdName)
                await this.executeParallel(...commandInfo.args);
            else
                await this.executeOne(commandInfo, messageInfo);
        }
        catch (err) {
            this.logger.log(err);
        }
    }

    // private async executeParallel(args: any): Promise<void> {
    //     let commandInfos: Array<CommandInfo> = args;
    //     let promises: Array<Promise<any>> = [];
    //     if (!commandInfos)
    //         return;
    //
    //     try {
    //         for (let i = 0; i < commandInfos.length; i++)
    //             promises.push(this.executeCommand(commandInfos[i], new MessageInfo()));
    //
    //         await Promise.all(promises);
    //     }
    //     catch (err) {
    //         this.logger.log(err);
    //     }
    // }

    private createCommandFileLookup() {
        fs.readdirSync(this.commandsDir).forEach((fileName: string) => {
            let _ = Processor.parseFileName(fileName);
            if (Processor.checkOnVersion(_))
                this.commandNames.set(_.name, `${this.commandsDir}${fileName}`);
        });
    }

    private static parseFileName(fileName: string): any  {
        let ss0 = fileName.split('-');
        let name = ss0[0];
        let ss1 = ss0[1].split('.');
        let version = parseInt(ss1[0]);
        let ext = ss1[1];
        let extMap = ss1.length > 2 ? ss1[2] : '';
        return { name, version, ext, extMap };
    }

    private static checkOnVersion(_: any): boolean {
        return Config.versionMin <= _.version && _.version <= Config.versionMax
               && _.ext.toLowerCase() === 'js' && _.extMap === '';
    }
}

