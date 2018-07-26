import { WsExceptionsHandler } from './../exceptions/ws-exceptions-handler';
export declare class WsProxy {
    create(targetCallback: (...args: any[]) => Promise<void>, exceptionsHandler: WsExceptionsHandler): (...args: any[]) => Promise<void>;
}
