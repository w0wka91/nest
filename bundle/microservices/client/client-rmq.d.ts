import { Connection } from 'amqplib';
import { ClientProxy } from './client-proxy';
import { ClientOptions } from '../interfaces';
export declare class ClientRMQ extends ClientProxy {
    private readonly options;
    private readonly logger;
    private client;
    private channel;
    private url;
    private queue;
    private prefetchCount;
    private isGlobalPrefetchCount;
    private queueOptions;
    private replyQueue;
    private responseEmitter;
    constructor(options: ClientOptions);
    protected publish(messageObj: any, callback: (err: any, result: any, disposed?: boolean) => void): void;
    private handleMessage;
    close(): void;
    handleError(client: Connection): void;
    listen(): void;
    connect(): Promise<any>;
}
