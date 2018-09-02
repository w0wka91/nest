import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    CatsModule,
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      // context: ({req}) => ({...req}),
    }),
  ],
})
export class ApplicationModule {}
