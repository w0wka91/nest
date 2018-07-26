import { ExceptionsHandler } from '../exceptions/exceptions-handler';
export declare type RouterProxyCallback = (req?: any, res?: any, next?: any) => void;
export declare class RouterProxy {
    createProxy(targetCallback: RouterProxyCallback, exceptionsHandler: ExceptionsHandler): (req: any, res: any, next: any) => Promise<void>;
    createExceptionLayerProxy(targetCallback: (err: any, req: any, res: any, next: any) => void, exceptionsHandler: ExceptionsHandler): (err: any, req: any, res: any, next: any) => Promise<void>;
}
