export interface ILogger {
    log(msg: string): Promise<void>;
}
