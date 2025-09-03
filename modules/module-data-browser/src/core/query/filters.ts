import { Query, Variable } from '@journeyapps/db';

export abstract class AbstractFilter {
  abstract augment(query: Query);
}

export enum Condition {
  EQUALS = '='
}

export interface Statement {
  condition: Condition;
  arg: any;
}

export class SimpleFilter extends AbstractFilter {
  constructor(
    public variable: Variable,
    public statements: Statement[]
  ) {
    super();
  }

  augment(query: Query) {
    return query.where(
      this.statements.map((s) => `${this.variable.name} ${s.condition} ?`).join(' or '),
      ...this.statements.map((s) => s.arg)
    );
  }
}
