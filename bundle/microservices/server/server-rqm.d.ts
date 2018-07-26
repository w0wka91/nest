import { Server } from './server';
import { CustomTransportStrategy } from './../interfaces';
import { MicroserviceOptions } from '../interfaces/microservice-configuration.interface';
export declare class ServerRMQ extends Server implements CustomTransportStrategy {
    private readonly options;
    private server;
    private channel;
    private url;
    private queue;
    private prefetchCount;
    private queueOptions;
    private isGlobalPrefetchCount;
    constructor(options: MicroserviceOptions);
    listen(callback: () => void): Promise<void>;
    private start;
    close(): void;
    private handleMessage;
    private sendMessage;
}
