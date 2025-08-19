import { AbstractConnection } from './AbstractConnection';
import { ObjectType } from '@journeyapps/parser-schema';
import { Collection } from '@journeyapps/db';
import { SchemaModelObject } from './SchemaModelObject';
import { LifecycleModel } from '@journeyapps-labs/lib-reactor-data-layer';

export interface SchemaModelDefinitionOptions {
  connection: AbstractConnection;
  definition: ObjectType;
}
export class SchemaModelDefinition implements LifecycleModel<ObjectType> {
  constructor(protected options: SchemaModelDefinitionOptions) {}

  get key() {
    return this.definition.name;
  }

  dispose() {}

  patch(data: ObjectType) {
    this.options.definition = data;
  }

  get connection() {
    return this.options.connection;
  }

  get definition() {
    return this.options.definition;
  }

  async getCollection() {
    const conn = await this.connection.getConnection();
    return conn[this.definition.name] as Collection;
  }

  async generateNewModelObject(): Promise<SchemaModelObject> {
    const collection = await this.getCollection();
    return new SchemaModelObject({
      definition: this,
      model: collection.create()
    });
  }
}
