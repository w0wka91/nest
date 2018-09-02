import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CatsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    console.log('Request in context is -> ', context.switchToHttp().getRequest());
    console.log('Request in gql-executioncontext is -> ', ctx.switchToHttp().getRequest());

    return true;
  }
}
