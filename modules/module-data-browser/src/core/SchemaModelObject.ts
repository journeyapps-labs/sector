import { ApiObjectData, DatabaseAdapter, DatabaseObject } from '@journeyapps/db';
import { SchemaModelDefinition } from './SchemaModelDefinition';
import { action, observable } from 'mobx';

export interface SchemaModelObjectOptions {
  definition: SchemaModelDefinition;
  adapter: DatabaseAdapter;
  model?: ApiObjectData;
}

export class SchemaModelObject {
  @observable
  accessor data: ApiObjectData;

  @observable
  accessor model: DatabaseObject;

  @observable
  accessor updated_at: Date;

  @observable
  accessor patch: Map<string, any>;

  constructor(public options: SchemaModelObjectOptions) {
    if (options.model) {
      this.setData(options.model);
    }
    this.patch = new Map<string, any>();
  }

  async applyPatches() {
    if (!this.model) {
      const collection = await this.definition.getCollection();
      this.model = collection.create();
    }
    for (let entry of this.patch.entries()) {
      if (this.definition.definition.belongsTo[entry[0]]) {
        this.model[entry[0]](entry[1].model);
      } else {
        this.model[entry[0]] = entry[1];
      }
    }
    this.patch.clear();
  }

  async save() {
    await this.definition.connection.batchSave([this]);
  }

  clearEdits() {
    this.patch.clear();
  }

  revert(field: string) {
    this.patch.delete(field);
  }

  set(field: string, value: any) {
    if (this.model?.[field] === value) {
      this.patch.delete(field);
    } else {
      this.patch.set(field, value);
    }
  }

  @action setData(data: ApiObjectData) {
    this.data = data;
    this.model = new DatabaseObject(this.options.adapter, this.definition.definition, data.id);
    // @ts-ignore
    this.model.resolve(data);
    this.updated_at = new Date(data._updated_at);
  }

  async reload() {
    await this.definition.load(this.id);
  }

  get definition(): SchemaModelDefinition {
    return this.options.definition;
  }

  get id() {
    return this.data.id;
  }
}
