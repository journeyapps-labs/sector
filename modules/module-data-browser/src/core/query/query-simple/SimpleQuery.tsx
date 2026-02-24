import { inject, ioc, TableColumn } from '@journeyapps-labs/reactor-mod';
import { ConnectionStore } from '../../../stores/ConnectionStore';
import { Promise, Variable } from '@journeyapps/db';
import { Page, PageRow } from '../Page';
import { SchemaModelDefinition } from '../../SchemaModelDefinition';
import * as _ from 'lodash';
import * as React from 'react';
import { action, observable } from 'mobx';
import { CellDisplayWidget } from '../widgets/CellDisplayWidget';
import { SmartColumnWidget } from '../widgets/SmartColumnWidget';
import { SerializedSimpleFilter, SimpleFilter } from '../filters';
import { SmartCellDisplayWidget } from '../widgets/SmartCellDisplayWidget';
import { SchemaModelObject } from '../../SchemaModelObject';
import { SimplePage } from './SimplePage';
import { AbstractQueryEncoded, AbstractSerializableQuery } from '../AbstractSerializableQuery';
import { SmartBelongsToDisplayWidget } from '../widgets/SmartBelongsToDisplayWidget';
import { ColumnDisplayWidget } from '../widgets/ColumnDisplayWidget';
import { TypeEngine } from '../../../forms/TypeEngine';

export interface SimpleQueryOptions {
  definition?: SchemaModelDefinition;
  limit?: number;
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface SimpleQuerySort {
  field: string;
  direction: SortDirection;
}

export interface SimpleQueryEncoded extends AbstractQueryEncoded {
  limit: number;
  definition: string;
  filters?: SerializedSimpleFilter[];
  sorts?: SimpleQuerySort[];
}

export class SimpleQuery extends AbstractSerializableQuery<SimpleQueryEncoded> {
  @inject(ConnectionStore)
  accessor connStore: ConnectionStore;

  @observable
  accessor _totalPages: number;

  @observable
  accessor _pages: Page[];

  simple_filters: Map<Variable, SimpleFilter>;

  @observable
  accessor sorts: SimpleQuerySort[];

  constructor(public options: SimpleQueryOptions = {}) {
    super('simple', options.definition?.connection);
    this._totalPages = 0;
    this._pages = [];
    this.simple_filters = new Map();
    this.sorts = [];
  }

  @action async load() {
    this._pages = [];
    let collection = await this.options.definition.getCollection();
    let query = collection.all();
    this.simple_filters.forEach((f) => {
      query = f.augment(query);
    });
    if (this.sorts.length > 0) {
      query = query.orderBy(
        ...this.sorts.map((sort) => {
          return sort.direction === SortDirection.DESC ? `-${sort.field}` : sort.field;
        })
      );
    }
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
        filters: Array.from(this.simple_filters.values()),
        sorts: this.sorts
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
      limit: this.options.limit,
      filters: Array.from(this.simple_filters.values()).map((filter) => filter.serialize()),
      sorts: [...this.sorts]
    };
  }

  async deserialize(connectionStore: ConnectionStore, data: SimpleQueryEncoded): Promise<void> {
    await super.deserialize(connectionStore, data);
    this.options.limit = data.limit;
    this.options.definition = await this.connection.waitForSchemaModelDefinitionByName(data.definition);
    this.simple_filters.clear();
    (data.filters || []).forEach((filter) => {
      if (!SimpleFilter.canDeserialize(filter)) {
        return;
      }
      const variable = _.find(_.values(this.options.definition.definition.attributes), (attribute) => {
        return attribute.name === filter.variable;
      });
      if (!variable) {
        return;
      }
      this.simple_filters.set(variable, SimpleFilter.deserialize(variable, filter));
    });
    this.sorts = (data.sorts || []).filter((sort) => {
      return !!sort?.field && (sort.direction === SortDirection.ASC || sort.direction === SortDirection.DESC);
    });
  }

  getSortableFields(): { key: string; label: string }[] {
    const definition = this.options.definition?.definition;
    if (!definition) {
      return [];
    }
    const dynamic = _.map(definition.attributes, (attribute) => {
      return {
        key: attribute.name,
        label: attribute.label || attribute.name
      };
    });
    return [{ key: 'id', label: 'ID' }, { key: 'updated_at', label: 'Updated at' }, ...dynamic];
  }

  async addSort(field: string): Promise<void> {
    if (this.sorts.find((sort) => sort.field === field)) {
      return;
    }
    this.sorts = [...this.sorts, { field, direction: SortDirection.ASC }];
    await this.load();
  }

  async removeSort(field: string): Promise<void> {
    this.sorts = this.sorts.filter((sort) => sort.field !== field);
    await this.load();
  }

  async toggleSort(field: string): Promise<void> {
    this.sorts = this.sorts.map((sort) => {
      if (sort.field !== field) {
        return sort;
      }
      return {
        ...sort,
        direction: sort.direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
      };
    });
    await this.load();
  }

  getSort(field: string): SimpleQuerySort | undefined {
    return this.sorts.find((sort) => sort.field === field);
  }

  async toggleSortCycle(field: string): Promise<void> {
    const current = this.getSort(field);
    if (!current) {
      await this.addSort(field);
      return;
    }
    if (current.direction === SortDirection.ASC) {
      await this.toggleSort(field);
      return;
    }
    await this.removeSort(field);
  }

  async reorderSort(field: string, beforeField: string): Promise<void> {
    if (field === beforeField) {
      return;
    }
    const source = this.sorts.find((sort) => sort.field === field);
    const target = this.sorts.find((sort) => sort.field === beforeField);
    if (!source || !target) {
      return;
    }
    const remaining = this.sorts.filter((sort) => sort.field !== field);
    const targetIndex = remaining.findIndex((sort) => sort.field === beforeField);
    remaining.splice(targetIndex, 0, source);
    this.sorts = remaining;
    await this.load();
  }

  getFilterableFields(): { key: string; label: string }[] {
    const definition = this.options.definition?.definition;
    if (!definition) {
      return [];
    }
    return _.map(definition.attributes, (attribute) => {
      const handler = ioc.get(TypeEngine).getHandler(attribute.type);
      if (!handler?.setupFilter) {
        return null;
      }
      return {
        key: attribute.name,
        label: attribute.label || attribute.name
      };
    }).filter((v) => !!v);
  }

  getActiveFilters(): { key: string; label: string; filter: SimpleFilter }[] {
    return Array.from(this.simple_filters.entries()).map(([variable, filter]) => {
      return {
        key: variable.name,
        label: variable.label || variable.name,
        filter
      };
    });
  }

  async removeFilter(field: string): Promise<void> {
    const variable = _.find(_.values(this.options.definition.definition.attributes), (attribute) => {
      return attribute.name === field;
    });
    if (!variable) {
      return;
    }
    this.simple_filters.delete(variable);
    await this.load();
  }

  async setupFilterForField(field: string, position?: MouseEvent): Promise<void> {
    const variable = _.find(_.values(this.options.definition.definition.attributes), (attribute) => {
      return attribute.name === field;
    });
    if (!variable) {
      return;
    }
    const handler = ioc.get(TypeEngine).getHandler(variable.type);
    if (!handler?.setupFilter) {
      return;
    }
    const existing = this.simple_filters.get(variable);
    const nextFilter = await handler.setupFilter({
      variable,
      filter: existing,
      position
    });
    if (!nextFilter) {
      return;
    }
    this.simple_filters.set(variable, nextFilter);
    await this.load();
  }

  getColumns(): TableColumn[] {
    const getSortLabel = (field: string, label: string) => {
      const sort = this.getSort(field);
      if (!sort) {
        return label;
      }
      return `${label} ${sort.direction === SortDirection.ASC ? '↑' : '↓'}`;
    };

    return [
      {
        key: 'id',
        display: (
          <ColumnDisplayWidget
            label={getSortLabel('id', 'ID')}
            onClick={async () => {
              await this.toggleSortCycle('id');
            }}
          />
        ),
        noWrap: true,
        shrink: true
      },
      {
        key: 'updated_at',
        display: (
          <ColumnDisplayWidget
            label={getSortLabel('updated_at', 'Updated at')}
            onClick={async () => {
              await this.toggleSortCycle('updated_at');
            }}
          />
        ),
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
              sortDirection={this.getSort(a.name)?.direction}
              onToggleSort={async () => {
                await this.toggleSortCycle(a.name);
              }}
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
