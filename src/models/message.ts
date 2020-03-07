export class Message {
    exchange:    string;
    queueName:   string;
    consumerTag: string;
    deliveryTag: number;
    redelivered: boolean;

    constructor(exchange:    string = '',
                queueName:   string = '',
                consumerTag: string = '',
                deliveryTag: number = -1,
                redelivered: boolean = false) {
        this.exchange = exchange;
        this.queueName = queueName;
        this.consumerTag = consumerTag;
        this.deliveryTag = deliveryTag;
        this.redelivered = redelivered;  
    }

    get isEmpty():boolean { return this.queueName === '' && this.deliveryTag === -1; }

    toString() { return !this.isEmpty ? `${JSON.stringify(this)}` : ''; }
}