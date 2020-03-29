export class Message {
    constructor(public exchange:    string = '',
                public queueName:   string = '',
                public consumerTag: string = '',
                public deliveryTag: number = -1,
                public redelivered: boolean = false) { }

    public get isEmpty():boolean { return this.queueName === '' && this.deliveryTag === -1; }

    public toString() { return !this.isEmpty ? `${JSON.stringify(this)}` : ''; }
}