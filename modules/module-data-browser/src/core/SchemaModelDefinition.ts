import { AbstractConnection } from './AbstractConnection';
import { ObjectType } from '@journeyapps/parser-schema';
import { Collection, JourneyAPIAdapter, Query } from '@journeyapps/db';
import { SchemaModelObject } from './SchemaModelObject';
import { LifecycleModel } from '@journeyapps-labs/lib-reactor-data-layer';
import { BaseObserver } from '@journeyapps-labs/common-utils';
import { queue, QueueObject } from 'async';
import { v4 } from 'uuid';

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
        let models = await this.executeQuery(collection.where(`id = ?`, id));
        if (models[0]) {
          this.cache.set(id, models[0]);
          this.enqueued.delete(id);
          this.iterateListeners((cb) => cb.resolved?.({ object: models[0] }));
        } else {
          this.enqueued.delete(id);
          this.iterateListeners((cb) => cb.failed?.({ object_id: id }));
        }
      } catch (ex) {
        this.enqueued.delete(id);
        this.iterateListeners((cb) => cb.failed?.({ object_id: id }));
        throw ex;
      }
    }, 6);
  }

  async search(text: string): Promise<SchemaModelObject[]> {
    let collection = await this.getCollection();
    let adapter = collection.adapter as JourneyAPIAdapter;
    // @ts-ignore
    let res = await adapter.apiPost(`${adapter.credentials.api4Url()}objects/${this.definition.name}/search.json`, {
      query: text
    });
    return res.objects
      .map((o) => {
        return JourneyAPIAdapter.apiToInternalFormat(this.definition, o);
      })
      .map((o) => {
        return new SchemaModelObject({
          definition: this,
          model: o,
          adapter: collection.adapter
        });
      });
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

  async executeQuery(query: Query) {
    let collection = await this.getCollection();
    let results = await collection.adapter.executeQuery(query);
    return results.map((m) => {
      if (!this.cache.has(m.id)) {
        const model = new SchemaModelObject({
          definition: this,
          model: m,
          adapter: collection.adapter
        });
        this.cache.set(m.id, model);
        return model;
      }

      let model = this.cache.get(m.id);
      model.setData(m);
      return model;
    });
  }

  async getCollection() {
    const conn = await this.connection.getConnection();
    return conn[this.definition.name] as Collection;
  }

  async generateNewModelObject(): Promise<SchemaModelObject> {
    const collection = await this.getCollection();
    return new SchemaModelObject({
      definition: this,
      adapter: collection.adapter,
      model: {
        id: v4(),
        type: this.definition.name,
        attributes: {},
        belongs_to: {}
      }
    });
  }
}
