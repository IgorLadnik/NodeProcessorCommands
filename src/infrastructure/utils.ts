export class Utils {
    static isValid = (obj: any):  boolean => obj !== undefined && obj !== null;
    static isNotEmptyString = (str: string): boolean => Utils.isValid(str) && str.length > 0;
}