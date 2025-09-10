import { Database, ObjectType, Query } from '@journeyapps/db';
import { Schema } from '@journeyapps/parser-schema';
import { AbstractConnectionFactory } from './AbstractConnectionFactory';
import * as _ from 'lodash';
import { SchemaModelDefinition } from './SchemaModelDefinition';
import { v4 } from 'uuid';
import { BaseObserver } from '@journeyapps-labs/common-utils';
import { Collection, LifecycleCollection } from '@journeyapps-labs/lib-reactor-data-layer';
import { when } from 'mobx';
import { EntityDescription } from '@journeyapps-labs/reactor-mod';
import { SchemaModelObject } from './SchemaModelObject';

export interface AbstractConnectionSerialized {
  factory: string;
  id: string;
  payload: any;
}

export interface AbstractConnectionListener {
  removed: () => any;
}

export abstract class AbstractConnection extends BaseObserver<AbstractConnectionListener> {
  id: string;

  schema_models_collection: Collection<ObjectType>;
  schema_models: LifecycleCollection<ObjectType, SchemaModelDefinition>;

  constructor(public factory: AbstractConnectionFactory) {
    super();
    this.id = v4();
    this.schema_models_collection = new Collection();
    this.schema_models = new LifecycleCollection({
      collection: this.schema_models_collection,
      generateModel: (o) => {
        return new SchemaModelDefinition({
          definition: o,
          connection: this
        });
      },
      getKeyForSerialized: (o) => {
        return o.name;
      }
    });
  }

  async batchSave(models: SchemaModelObject[]) {
    if (models.length === 0) {
      return;
    }
    const database = await this.getConnection();
    let batch = new database.Batch();
    for (let model of models) {
      await model.applyPatches();
      batch.save(model.model);
    }
    await batch.execute();
    for (let model of models) {
      model.reload();
    }
  }

  getSchemaModelDefinitionByName(name: string) {
    return this.schema_models.items.find((i) => i.definition.name === name);
  }

  async waitForSchemaModelDefinitionByName(name: string) {
    await when(() => !!this.getSchemaModelDefinitionByName(name));
    return this.getSchemaModelDefinitionByName(name);
  }

  abstract getConnection(): Promise<Database>;

  protected async getSchema(): Promise<Schema> {
    const connection = await this.getConnection();
    return connection.schema;
  }

  async reload() {
    await this.schema_models_collection.load(async () => {
      const schema = await this.getSchema();
      return _.values(schema.objects);
    });
  }

  async init() {
    await this.reload();
  }

  protected async getSchemaModelDefinitions() {
    const schema = await this.getSchema();
    return _.map(schema.objects, (o) => {
      return new SchemaModelDefinition({
        definition: o,
        connection: this
      });
    });
  }

  remove() {
    this.iterateListeners((cb) => cb.removed?.());
  }

  serialize(): AbstractConnectionSerialized {
    return {
      id: this.id,
      factory: this.factory.options.key,
      payload: this._serialize()
    };
  }

  get name(): EntityDescription {
    return {
      simpleName: this.id
    };
  }

  abstract _serialize(): any;

  abstract _deSerialize(data: ReturnType<this['_serialize']>): Promise<any>;
}
