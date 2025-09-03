import { AbstractConnection } from './AbstractConnection';
import { ObjectType } from '@journeyapps/parser-schema';
import { Collection } from '@journeyapps/db';
import { SchemaModelObject } from './SchemaModelObject';
import { LifecycleModel } from '@journeyapps-labs/lib-reactor-data-layer';
import { BaseObserver } from '@journeyapps-labs/common-utils';
import { queue, QueueObject } from 'async';

export interface SchemaModelDefinitionListener {
  resolved: (event: { object: SchemaModelObject }) => any;
  failed: (event: { object_id: string }) => any;
}

export interface SchemaModelDefinitionOptions {
  connection: AbstractConnection;
  definition: ObjectType;
}
export class SchemaModelDefinition
  extends BaseObserver<SchemaModelDefinitionListener>
  implements LifecycleModel<ObjectType>
{
  cache: Map<string, SchemaModelObject>;
  queue: QueueObject<string>;
  enqueued: Set<string>;

  constructor(protected options: SchemaModelDefinitionOptions) {
    super();
    this.cache = new Map<string, SchemaModelObject>();
    this.enqueued = new Set<string>();
    this.queue = queue(async (id) => {
      let collection = await this.getCollection();
      try {
        let model = await collection.first(id);
        if (model) {
          let object = new SchemaModelObject({
            model,
            definition: this
          });
          this.cache.set(id, object);
          this.enqueued.delete(id);
          this.iterateListeners((cb) => cb.resolved?.({ object }));
        } else {
          this.iterateListeners((cb) => cb.failed?.({ object_id: id }));
        }
      } catch (ex) {
        this.iterateListeners((cb) => cb.failed?.({ object_id: id }));
        throw ex;
      }
    }, 6);
  }

  async resolve(id: string): Promise<SchemaModelObject | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    if (!this.enqueued.has(id)) {
      this.enqueued.add(id);
      this.queue.push(id);
    }

    return await new Promise<SchemaModelObject>((resolve) => {
      let l1 = this.registerListener({
        resolved: ({ object }) => {
          if (object.model.id === id) {
            l1();
            resolve(object);
          }
        },
        failed: ({ object_id }) => {
          if (object_id === id) {
            l1();
            resolve(null);
          }
        }
      });
    });
  }

  get key() {
    return this.definition.name;
  }

  dispose() {
    this.queue.kill();
  }

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
