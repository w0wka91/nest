import { Scalar } from '@nestjs/graphql/dist/decorators/resolvers.decorators';
import { Kind } from 'graphql/language';

@Scalar('Date')
export class DateScalar {
  readonly description = 'Date custom scalar type';

  parseValue(value): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10); // ast value is always in string format
    }
    return null;
  }
}