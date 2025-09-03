import { AbstractQuery, AbstractQueryEncoded } from './AbstractQuery';
import { ActionSource, inject, TableColumn } from '@journeyapps-labs/reactor-mod';
import { ConnectionStore } from '../../stores/ConnectionStore';
import * as db from '@journeyapps/db';
import { Promise, Type, Variable } from '@journeyapps/db';
import { Page, PageRow } from './Page';
import { SchemaModelDefinition } from '../SchemaModelDefinition';
import * as _ from 'lodash';
import * as React from 'react';
import { action, observable } from 'mobx';
import { CellDisplayWidget } from './widgets/CellDisplayWidget';
import { BelongsToDisplayWidget } from './widgets/BelongsToDisplayWidget';
import { EditSchemaModelAction } from '../../actions/schema-model/EditSchemaModelAction';
import { SmartColumnWidget } from './widgets/SmartColumnWidget';
import { AbstractFilter, SimpleFilter } from './filters';

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

  simple_filters: Map<Variable, SimpleFilter>;

  constructor(public options: SimpleQueryOptions = {}) {
    super('simple', options.definition?.connection);
    this._totalPages = 0;
    this._pages = [];
    this.simple_filters = new Map();
  }

  async getCollection() {
    let connection = await this.connection.getConnection();
    return connection[this.options.definition.definition.name] as db.Collection;
  }

  @action async load() {
    this._pages = [];
    let collection = await this.getCollection();

    let query = collection.all();
    this.simple_filters.forEach((f) => {
      query = f.augment(query);
    });

    let results = await (collection.adapter as any).doApiQuery(query);
    this._totalPages = Math.ceil(results.total / this.options.limit);
  }

  getPage(number: number): Page {
    if (!this._pages[number]) {
      let page = new Page({
        offset: number * this.options.limit,
        limit: this.options.limit,
        collection: () => this.getCollection(),
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
      ..._.map(this.options.definition.definition.belongsToIdVars, (a) => {
        return {
          key: a.name,
          display: a.name,
          noWrap: true,
          shrink: true,
          accessor: (cell, row: PageRow) => {
            return (
              <BelongsToDisplayWidget
                open={(object) => {
                  EditSchemaModelAction.get().fireAction({
                    source: ActionSource.BUTTON,
                    targetEntity: object
                  });
                }}
                relationship={row.model.definition.definition.belongsTo[a.relationship]}
                connection={this.connection}
                id={row.model.model[a.name]}
              />
            );
          }
        } as TableColumn;
      }),
      ..._.map(this.options.definition.definition.attributes, (a) => {
        // @ts-ignore FIXME, remove when `display` supports JSX.Element as a type
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
