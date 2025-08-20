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
}
