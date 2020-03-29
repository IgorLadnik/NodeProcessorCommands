const fetch = require('node-fetch');
import { Dictionary } from 'dictionaryjs';

export class CmdFunc {
    constructor(private readonly injections: Array<any>,
                private fn: Function,
                private readonly isValid: boolean) { }

    async call(...args: Array<any>): Promise<boolean> {
        if (!this.isValid)
            return false;

        let arr = ArrayUtils.merge(this.injections, args);

        try {
            return await this.fn(...arr);
        }
        catch (err){
            console.log(`ERROR: ${err}`);
            return false;
        }
    }
}

export class RemoteCodeLoader {
    constructor(private readonly baseUrl: string, private readonly injections: Dictionary<string, any>) { }

    async importRemoteCode(remoteCodeName: string, ...args: Array<string>): Promise<CmdFunc> {
        let fn: Function;
        let url = `${this.baseUrl}${remoteCodeName}`;
        let script = await fetch(url);
        if (!script.ok)
            return new CmdFunc([], new Function(), false);

        let arr = ArrayUtils.merge(this.injections.keys(), args);

        try {
            let strFunc = `return (async () => { ${await script.text()} })()`;
            fn = new Function(...arr, strFunc);
        } catch (err) {
            console.log(`*** ERROR: ${err}`);
            return new CmdFunc([], new Function(), false);
        }

        let arr1 = new Array<any>();
        for (let i = 0; i < this.injections.length; i++)
            arr1.push(this.injections.get(this.injections.keys()[i]));
        
        return new CmdFunc(arr1, fn, true);
    }
}

class ArrayUtils {
    static merge(arr1: Array<any>, arr2: Array<any>): Array<any> {
        let arr = new Array<any>();
        for (let i = 0; i < arr1.length; i++)
            arr.push(arr1[i]);
        for (let i = 0; i < arr2.length; i++)
            arr.push(arr2[i]);

        return arr;
    }
}
