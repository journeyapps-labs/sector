import { SchemaModelObject } from '../SchemaModelObject';
import { TableRow } from '@journeyapps-labs/reactor-mod';
import { Collection, DatabaseObject } from '@journeyapps/db';
import { observable } from 'mobx';
import { SchemaModelDefinition } from '../SchemaModelDefinition';

export interface PageRow extends TableRow {
  model: SchemaModelObject;
  definition: SchemaModelDefinition;
}

export interface PageOptions {
  collection: () => Promise<Collection<DatabaseObject>>;
  offset: number;
  limit: number;
  definition: SchemaModelDefinition;
  index: number;
}

export class Page {
  @observable
  accessor models: SchemaModelObject[];

  @observable
  accessor loading: boolean;

  constructor(protected options: PageOptions) {
    this.loading = true;
    this.models = [];
  }

  get index() {
    return this.options.index;
  }

  async load() {
    this.loading = true;
    let collection = await this.options.collection();
    let models = await collection.all().limit(this.options.limit).skip(this.options.offset).toArray();
    this.models = models.map((m) => {
      return new SchemaModelObject({
        definition: this.options.definition,
        model: m
      });
    });
    this.loading = false;
  }

  asRows(): PageRow[] {
    return this.models.map((m) => {
      return {
        key: m.model.id,
        cells: m.model,
        definition: this.options.definition,
        model: m
      };
    });
  }
}
