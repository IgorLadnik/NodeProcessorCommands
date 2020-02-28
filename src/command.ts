export class Command {
    name: string;
    args: any;
    
    constructor(name: string, args: any) {
        this.name = name;
        this.args = args;
    }
}