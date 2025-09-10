import { inject, TableColumn } from '@journeyapps-labs/reactor-mod';
import { ConnectionStore } from '../../../stores/ConnectionStore';
import { Promise, Variable } from '@journeyapps/db';
import { Page, PageRow } from '../Page';
import { SchemaModelDefinition } from '../../SchemaModelDefinition';
import * as _ from 'lodash';
import * as React from 'react';
import { action, observable } from 'mobx';
import { CellDisplayWidget } from '../widgets/CellDisplayWidget';
import { SmartColumnWidget } from '../widgets/SmartColumnWidget';
import { SimpleFilter } from '../filters';
import { SmartCellDisplayWidget } from '../widgets/SmartCellDisplayWidget';
import { SchemaModelObject } from '../../SchemaModelObject';
import { SimplePage } from './SimplePage';
import { AbstractQueryEncoded, AbstractSerializableQuery } from '../AbstractSerializableQuery';
import { SmartBelongsToDisplayWidget } from '../widgets/SmartBelongsToDisplayWidget';

export interface SimpleQueryOptions {
  definition?: SchemaModelDefinition;
  limit?: number;
}

export interface SimpleQueryEncoded extends AbstractQueryEncoded {
  limit: number;
  definition: string;
}

export class SimpleQuery extends AbstractSerializableQuery<SimpleQueryEncoded> {
  @inject(ConnectionStore)
  accessor connStore: ConnectionStore;

  @observable
  accessor _totalPages: number;

  @observable
  accessor _pages: Page[];

  simple_filters: Map<Variable, SimpleFilter>;

  constructor(public options: SimpleQueryOptions = {}) {
    super('simple', options.definition?.connection);
    this._totalPages = 0;
    this._pages = [];
    this.simple_filters = new Map();
  }

  @action async load() {
    this._pages = [];
    let collection = await this.options.definition.getCollection();
    let query = collection.all();
    this.simple_filters.forEach((f) => {
      query = f.augment(query);
    });
    let results = await (collection.adapter as any).doApiQuery(query);
    this._totalPages = Math.ceil(results.total / this.options.limit);
  }

  getPage(number: number): Page {
    if (!this._pages[number]) {
      let page = new SimplePage({
        offset: number * this.options.limit,
        limit: this.options.limit,
        definition: this.options.definition,
        index: number,
        filters: Array.from(this.simple_filters.values())
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
      {
        key: 'updated_at',
        display: 'Updated at',
        noWrap: true,
        shrink: true,
        accessor: (cell, row: PageRow) => {
          return <CellDisplayWidget name="updated_at" cell={row.model.updated_at} row={row} />;
        }
      },
      ..._.map(this.options.definition.definition.belongsToIdVars, (a) => {
        return {
          key: a.name,
          display: (
            <SmartColumnWidget
              variable={this.options.definition.definition.belongsToVars[a.relationship]}
              type={this.options.definition.definition.belongsTo[a.relationship].foreignType}
              filterChanged={(filter) => {}}
            />
          ),
          noWrap: true,
          shrink: true,
          accessor: (cell, row: PageRow) => {
            return <SmartBelongsToDisplayWidget variable_id={a} row={row} connection={this.connection} />;
          }
        } as TableColumn;
      }),
      ..._.map(this.options.definition.definition.attributes, (a) => {
        return {
          key: a.name,
          display: (
            <SmartColumnWidget
              variable={a}
              filter={this.simple_filters.get(a)}
              filterChanged={(filter) => {
                if (!filter) {
                  this.simple_filters.delete(a);
                  this.load();
                } else {
                  this.simple_filters.set(a, filter);
                  this.load();
                }
              }}
            />
          ),
          noWrap: true,
          shrink: true,
          accessor: (cell, row: PageRow) => {
            return <SmartCellDisplayWidget name={a.name} row={row} />;
          }
        } as TableColumn;
      })
    ];
  }

  getSimpleName(): string {
    return `Query: ${this.options.definition.definition.label}`;
  }

  getDirtyObjects(): SchemaModelObject[] {
    return _.flatMap(
      this._pages.filter((p) => !!p),
      (page) => page.getDirtyObjects()
    );
  }
}
