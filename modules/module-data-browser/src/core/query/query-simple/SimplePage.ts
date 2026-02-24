import { Page, PageOptions } from '../Page';
import { AbstractFilter } from '../filters';
import { SimpleQuerySort, SortDirection } from './SimpleQuery';

export interface SimplePageOptions extends PageOptions {
  offset: number;
  limit: number;
  filters: AbstractFilter[];
  sorts?: SimpleQuerySort[];
}

export class SimplePage extends Page {
  constructor(protected options2: SimplePageOptions) {
    super(options2);
  }

  async load() {
    this.loading = true;
    let collection = await this.options.definition.getCollection();
    let query = collection.all();

    this.options2.filters.forEach((f) => {
      query = f.augment(query);
    });
    if ((this.options2.sorts || []).length > 0) {
      query = query.orderBy(
        ...this.options2.sorts.map((sort) => {
          return sort.direction === SortDirection.DESC ? `-${sort.field}` : sort.field;
        })
      );
    }

    this.models = await this.options.definition.executeQuery(
      query.limit(this.options2.limit).skip(this.options2.offset)
    );
    this.loading = false;
  }
}
