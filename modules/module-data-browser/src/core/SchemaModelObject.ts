import { DatabaseObject } from '@journeyapps/db';
import { SchemaModelDefinition } from './SchemaModelDefinition';

export interface SchemaModelObjectOptions {
  definition: SchemaModelDefinition;
  model?: DatabaseObject;
}

export class SchemaModelObject {
  constructor(public options: SchemaModelObjectOptions) {}

  get definition(): SchemaModelDefinition {
    return this.options.definition;
  }

  get model() {
    return this.options.model;
  }

  async displayValue(): Promise<string> {
    if (!this.model) {
      return null;
    }
    let val = this.model.toString();
    if (val) {
      return val;
    }
    /*
      there are scenarios where the FormatStringScope has not yet completed setting up its state +
      parsing the format string directive. We therefore poll for a bit until we get the value. Ideally
      we need a better way to determine when the scope is ready, but could not find one yet.
     */
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      let val = this.model.toString();
      if (val) {
        return val;
      }
    }
    return null;
  }
}
