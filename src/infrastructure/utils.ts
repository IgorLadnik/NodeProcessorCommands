import _ from 'lodash'
import { ILogger } from "../interfaces/ilogger";

export class Utils {
    static isNotEmptyString = (str: string): boolean => !_.isNil(str) && str.length > 0;

    static delay = (duration: number, logger: ILogger): Promise<void> =>
        new Promise(resolve => setTimeout(() => {
            resolve();
            logger?.log(`delay for ${duration} ms`);
        }, duration)
    );

    static isWeb = (str: string): boolean => Utils.isNotEmptyString(str) && str.toLowerCase().indexOf('http') === 0;
}