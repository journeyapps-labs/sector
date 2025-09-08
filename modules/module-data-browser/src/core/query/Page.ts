import { SchemaModelObject } from '../SchemaModelObject';
import { TableRow } from '@journeyapps-labs/reactor-mod';
import { computed, observable } from 'mobx';
import { SchemaModelDefinition } from '../SchemaModelDefinition';
import { AbstractFilter } from './filters';

export interface PageRow extends TableRow {
  model: SchemaModelObject;
  definition: SchemaModelDefinition;
}

export interface PageOptions {
  offset: number;
  limit: number;
  definition: SchemaModelDefinition;
  index: number;
  filters: AbstractFilter[];
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

  reset() {
    this.models.forEach((m) => {
      m.patch.clear();
    });
  }

  @computed get dirty() {
    return this.models.find((m) => m.patch.size > 0);
  }

  async load() {
    this.loading = true;
    let collection = await this.options.definition.getCollection();
    let query = collection.all();

    this.options.filters.forEach((f) => {
      query = f.augment(query);
    });

    this.models = await this.options.definition.executeQuery(query.limit(this.options.limit).skip(this.options.offset));
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
