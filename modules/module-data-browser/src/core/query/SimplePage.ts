import { Page, PageOptions } from './Page';
import { AbstractFilter } from './filters';

export interface SimplePageOptions extends PageOptions {
  offset: number;
  limit: number;
  filters: AbstractFilter[];
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

    this.models = await this.options.definition.executeQuery(
      query.limit(this.options2.limit).skip(this.options2.offset)
    );
    this.loading = false;
  }
}
