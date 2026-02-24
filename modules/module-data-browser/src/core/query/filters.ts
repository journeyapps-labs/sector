import { Query, Variable } from '@journeyapps/db';
import { EntityLabel } from '@journeyapps-labs/reactor-mod';

export abstract class AbstractFilter {
  abstract augment(query: Query);
}

export enum Condition {
  EQUALS = '='
}

export interface SerializedStatement {
  condition: Condition;
  arg: any;
}

export interface SerializedSimpleFilter {
  variable: string;
  statements: SerializedStatement[];
}

export abstract class AbstractStatement {
  abstract readonly condition: Condition;

  constructor(public arg: any) {}

  serialize(): SerializedStatement {
    return {
      condition: this.condition,
      arg: this.arg
    };
  }

  static deserialize(data: SerializedStatement): AbstractStatement {
    if (data.condition === Condition.EQUALS) {
      return new EqualsStatement(data.arg);
    }
    throw new Error(`Unsupported statement condition: ${data.condition}`);
  }

  getMetadataLabel(): EntityLabel {
    return {
      label: this.condition,
      value: `${this.arg}`
    };
  }
}

export class EqualsStatement extends AbstractStatement {
  readonly condition = Condition.EQUALS;
}

export class SimpleFilter extends AbstractFilter {
  public statements: AbstractStatement[];

  constructor(variable: Variable, statements: (AbstractStatement | SerializedStatement)[]) {
    super();
    this.variable = variable;
    this.statements = (statements || []).map((statement) => {
      if (statement instanceof AbstractStatement) {
        return statement;
      }
      return AbstractStatement.deserialize(statement);
    });
  }

  public variable: Variable;

  augment(query: Query) {
    return query.where(
      this.statements.map((s) => `${this.variable.name} ${s.condition} ?`).join(' or '),
      ...this.statements.map((s) => s.arg)
    );
  }

  serialize(): SerializedSimpleFilter {
    return {
      variable: this.variable.name,
      statements: this.statements.map((statement) => statement.serialize())
    };
  }

  static deserialize(variable: Variable, data: SerializedSimpleFilter): SimpleFilter {
    if (!data || !Array.isArray(data.statements)) {
      return new SimpleFilter(variable, []);
    }
    return new SimpleFilter(variable, data.statements);
  }

  getMetadata() {
    if (!this.statements || this.statements.length === 0) {
      return [];
    }

    return this.statements.map((statement) => statement.getMetadataLabel());
  }
}
