import { ILogger } from "../interfaces/ilogger";

export class CommandFunctionWrapper {
    constructor(private fn: Function,
                private readonly isValid: boolean,
                private readonly l: ILogger/*,
                private readonly dependencies: Array<any> = []*/) { }

    async call(...args: Array<any>): Promise<boolean> {
        if (!this.isValid)
            return false;

        //let arr = ArrayUtils.merge(args, this.dependencies);
        let arr = args;

        try {
            return await this.fn(...arr);
        }
        catch (err){
            this.l.log(`ERROR: ${err}`);
            return false;
        }
    }
}

// class ArrayUtils {
//     static merge(arr1: Array<any>, arr2: Array<any>): Array<any> {
//         let arr = new Array<any>();
//         for (let i = 0; i < arr1.length; i++)
//             arr.push(arr1[i]);
//         for (let i = 0; i < arr2.length; i++)
//             arr.push(arr2[i]);
//
//         return arr;
//     }
// }
