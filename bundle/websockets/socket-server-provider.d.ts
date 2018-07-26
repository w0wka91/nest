import { SocketsContainer } from './container';
import { ObservableSocketServer } from './interfaces/observable-socket-server.interface';
import { ApplicationConfig } from '@nestjs/core/application-config';
export declare class SocketServerProvider {
    private readonly socketsContainer;
    private readonly applicationConfig;
    constructor(socketsContainer: SocketsContainer, applicationConfig: ApplicationConfig);
    scanForSocketServer(options: any, port: number): ObservableSocketServer;
    private createSocketServer;
    private createWithNamespace;
    private getServerOfNamespace;
    private validateNamespace;
}
