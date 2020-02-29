export class ItemInfo {
    exchange:    string;
    queueName:   string;
    consumerTag: string;
    deliveryTag: number;
    redelivered: boolean;

    constructor(exchange:    string, 
                queueName:   string,
                consumerTag: string,
                deliveryTag: number,
                redelivered: boolean) {
        this.exchange = exchange;
        this.queueName = queueName;
        this.consumerTag = consumerTag;
        this.deliveryTag = deliveryTag;
        this.redelivered = redelivered;  
    }
}