import { AbstractQuery, AbstractQueryEncoded } from './AbstractQuery';
import {
  CheckboxWidget,
  inject,
  MetadataWidget,
  SmartDateDisplayWidget,
  styled,
  TableColumn
} from '@journeyapps-labs/reactor-mod';
import { ConnectionStore } from '../../stores/ConnectionStore';
import * as db from '@journeyapps/db';
import { Attachment, Location, Promise } from '@journeyapps/db';
import { Page, PageRow } from './Page';
import { SchemaModelDefinition } from '../SchemaModelDefinition';
import * as _ from 'lodash';
import * as React from 'react';
import { observable } from 'mobx';

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
      ..._.map(this.options.definition.definition.attributes, (a) => {
        return {
          key: a.name,
          display: a.label,
          noWrap: true,
          shrink: true,
          accessor: (cell, row: PageRow) => {
            return <CellDisplayWidget cell={cell} row={row} />;
          }
        } as TableColumn;
      })
    ];
  }

  getSimpleName(): string {
    return `Query: ${this.options.definition.definition.label}`;
  }
}

namespace S {
  export const Empty = styled.div`
    opacity: 0.2;
  `;

  export const Preview = styled.img`
    max-height: 40px;
    max-width: 40px;
  `;

  export const pill = styled.div`
    padding: 2px 4px;
    background: ${(p) => p.theme.table.pills};
    border-radius: 3px;
    font-size: 12px;
  `;

  export const Pills = styled.div`
    display: flex;
    column-gap: 2px;
    row-gap: 2px;
  `;
}

export interface CellDisplayWidgetProps {
  row: PageRow;
  cell: any;
}

const MAX_NUMBER_OF_ARR_ITEMS_TO_DISPLAY = 3;

export const CellDisplayWidget: React.FC<CellDisplayWidgetProps> = (props) => {
  const { row, cell } = props;
  if (cell == null) {
    return <S.Empty>null</S.Empty>;
  }
  if (_.isString(cell)) {
    if (cell.trim() === '') {
      return <S.Empty>empty</S.Empty>;
    }
    return cell;
  }
  if (_.isArray(cell)) {
    if (cell.length === 0) {
      return <S.Empty>empty array</S.Empty>;
    }

    let items = _.slice(cell, 0, MAX_NUMBER_OF_ARR_ITEMS_TO_DISPLAY);

    return (
      <S.Pills>
        {items.map((c) => {
          return <S.pill key={c}>{c}</S.pill>;
        })}
        {items.length !== cell.length ? '...' : null}
      </S.Pills>
    );
  }
  if (cell instanceof Date) {
    return <SmartDateDisplayWidget date={cell} />;
  }
  if (_.isBoolean(cell)) {
    return <CheckboxWidget checked={cell} onChange={() => {}} />;
  }
  if (cell instanceof Location) {
    return (
      <>
        <MetadataWidget label={'Lat'} value={`${cell.latitude}`} />
        <MetadataWidget label={'Long'} value={`${cell.longitude}`} />
      </>
    );

    return JSON.stringify(cell.toJSON());
  }
  if (cell instanceof Attachment) {
    if (cell.uploaded()) {
      return <S.Preview src={cell.urls['thumbnail']} />;
    }
    return <S.Empty>Not uploaded</S.Empty>;
  }
  console.log('unknown type', cell);
  return null;
};
