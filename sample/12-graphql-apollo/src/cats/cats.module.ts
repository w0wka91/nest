import { Module } from '@nestjs/common';
import { CatsResolvers } from './cats.resolvers';
import { DateScalar } from './cats.scalar';
import { CatsService } from './cats.service';

@Module({
  providers: [CatsService, CatsResolvers, DateScalar],
})
export class CatsModule {}
