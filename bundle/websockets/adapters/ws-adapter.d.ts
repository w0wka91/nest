/// <reference types="node" />
import { WebSocketAdapter } from '@nestjs/common';
import { Server } from 'http';
import { Observable } from 'rxjs';
import { MessageMappingProperties } from '../gateway-metadata-explorer';
export declare class WsAdapter implements WebSocketAdapter {
    private readonly httpServer;
    private readonly logger;
    constructor(httpServer?: Server | null);
    create(port: number, options?: any & {
        namespace?: string;
        server?: any;
    }): any;
    bindClientConnect(server: any, callback: (...args: any[]) => void): void;
    bindClientDisconnect(client: any, callback: (...args: any[]) => void): void;
    bindMessageHandlers(client: any, handlers: MessageMappingProperties[], transform: (data: any) => Observable<any>): void;
    bindMessageHandler(buffer: any, handlers: MessageMappingProperties[], transform: (data: any) => Observable<any>): Observable<any>;
    close(server: any): void;
    bindErrorHandler(server: any): any;
}
