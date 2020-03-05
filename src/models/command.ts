export class Command {
    name: string;
    args: any;
    
    constructor(name: string, args: any = undefined) {
        this.name = name;
        this.args = args;
    }
}