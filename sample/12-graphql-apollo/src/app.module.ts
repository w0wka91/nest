import { Module } from '@nestjs/common';
import { GraphQLFactory, GraphQLModule } from '@nestjs/graphql';
import { CatsModule } from './cats/cats.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SubscriptionsService } from './subscriptions/subscriptions.service';

@Module({
  imports: [
    SubscriptionsModule.forRoot(),
    CatsModule,
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
    } as any),
  ],
})
export class ApplicationModule {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly graphQLFactory: GraphQLFactory,
  ) {}
  /*
  configure(consumer: MiddlewareConsumer) {
    const schema = this.createSchema();
    this.subscriptionsService.createSubscriptionServer(schema);

    consumer
      .apply(
        graphiqlExpress({
          endpointURL: '/graphql',
          subscriptionsEndpoint: `ws://localhost:3001/subscriptions`,
        }),
      )
      .forRoutes('/graphiql')
      .apply(graphqlExpress(req => ({ schema, rootValue: req })))
      .forRoutes('/graphql');
  }

  createSchema() {
    return this.graphQLFactory.createSchema({ typeDefs });
}*/
}
