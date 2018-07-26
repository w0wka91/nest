import { Observable } from 'rxjs';
import { RpcExceptionsHandler } from '../exceptions/rpc-exceptions-handler';
export declare class RpcProxy {
    create(targetCallback: (...args: any[]) => Promise<Observable<any>>, exceptionsHandler: RpcExceptionsHandler): (...args: any[]) => Promise<Observable<any>>;
}
