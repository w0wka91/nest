import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import graphqlPlayground from 'graphql-playground-middleware-express';
import { CatsModule } from './cats/cats.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule.forRoot(), CatsModule, GraphQLModule.forRoot()],
})
export class ApplicationModule {
  configure(consumer) {
    consumer
      .apply(
        graphqlPlayground({
          endpoint: '/graphql',
        }),
        () => {},
      )
      .forRoutes('/graphiql');
  }
}
