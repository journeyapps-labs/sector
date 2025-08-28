import { AbstractQuery, AbstractQueryEncoded } from './AbstractQuery';
import { inject, TableColumn } from '@journeyapps-labs/reactor-mod';
import { ConnectionStore } from '../../stores/ConnectionStore';
import * as db from '@journeyapps/db';
import { Promise } from '@journeyapps/db';
import { Page, PageRow } from './Page';
import { SchemaModelDefinition } from '../SchemaModelDefinition';
import * as _ from 'lodash';
import * as React from 'react';
import { observable } from 'mobx';
import { CellDisplayWidget } from './widgets/CellDisplayWidget';
import { BelongsToDisplayWidget } from './widgets/BelongsToDisplayWidget';

export interface SimpleQueryOptions {
  definition?: SchemaModelDefinition;
  limit?: number;
}

export interface SimpleQueryEncoded extends AbstractQueryEncoded {
  limit: number;
  definition: string;
}

export class SimpleQuery extends AbstractQuery<SimpleQueryEncoded> {
  @inject(ConnectionStore)
  accessor connStore: ConnectionStore;

  @observable
  accessor _totalPages: number;

  @observable
  accessor _pages: Page[];

  constructor(public options: SimpleQueryOptions = {}) {
    super('simple', options.definition?.connection);
    this._totalPages = 0;
    this._pages = [];
  }

  async getCollection() {
    let connection = await this.connection.getConnection();
    return connection[this.options.definition.definition.name] as db.Collection;
  }

  async load() {
    let collection = await this.getCollection();
    let results = await (collection.adapter as any).doApiQuery(collection.all());
    this._totalPages = Math.ceil(results.total / this.options.limit);
  }

  getPage(number: number): Page {
    if (!this._pages[number]) {
      let page = new Page({
        offset: number * this.options.limit,
        limit: this.options.limit,
        collection: () => this.getCollection(),
        definition: this.options.definition,
        index: number
      });
      page.load();
      this._pages[number] = page;
    }
    return this._pages[number];
  }

  get totalPages(): number {
    return this._totalPages;
  }

  serialize(): SimpleQueryEncoded {
    return {
      ...super.serialize(),
      definition: this.options.definition.definition.name,
      limit: this.options.limit
    };
  }

  async deserialize(connectionStore: ConnectionStore, data: SimpleQueryEncoded): Promise<void> {
    await super.deserialize(connectionStore, data);
    this.options.limit = data.limit;
    this.options.definition = await this.connection.waitForSchemaModelDefinitionByName(data.definition);
  }

  getColumns(): TableColumn[] {
    return [
      {
        key: 'id',
        display: 'ID',
        noWrap: true,
        shrink: true
      },
      ..._.map(this.options.definition.definition.belongsToIdVars, (a) => {
        return {
          key: a.name,
          display: a.name,
          noWrap: true,
          shrink: true,
          accessor: (cell, row: PageRow) => {
            return <BelongsToDisplayWidget variable={a} connection={this.connection} id={row.model.model[a.name]} />;
          }
        } as TableColumn;
      }),
      ..._.map(this.options.definition.definition.attributes, (a) => {
        return {
          key: a.name,
          display: a.label,
          noWrap: true,
          shrink: true,
          accessor: (cell, row: PageRow) => {
            return <CellDisplayWidget variable={a} cell={cell} row={row} />;
          }
        } as TableColumn;
      })
    ];
  }

  getSimpleName(): string {
    return `Query: ${this.options.definition.definition.label}`;
  }
}
