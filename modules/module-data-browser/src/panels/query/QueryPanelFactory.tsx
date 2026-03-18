import * as React from 'react';
import { inject, ioc, ReactorPanelModel } from '@journeyapps-labs/reactor-mod';
import { QueryPanelWidget } from './QueryPanelWidget';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { ConnectionStore } from '../../stores/ConnectionStore';
import { observable } from 'mobx';
import { WorkspaceEngine, WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import { AbstractSerializableQuery } from '../../core/query/AbstractSerializableQuery';
import { SavedQueryStore } from '../../stores/SavedQueryStore';
import { AbstractConnection } from '../../core/AbstractConnection';
import { SharedConnectionPanelFactory } from '../_shared/SharedConnectionPanelFactory';
import { Page } from '../../core/query/Page';

export class QueryPanelModel extends ReactorPanelModel {
  @inject(ConnectionStore)
  accessor connStore: ConnectionStore;

  @observable
  accessor query: AbstractQuery;

  @observable
  accessor current_page: number;

  @observable.ref
  accessor current_page_data: Page | null;

  accessor table_scroll_top: number;
  accessor table_scroll_left: number;

  constructor(query: AbstractQuery) {
    super(QueryPanelFactory.TYPE);
    this.setExpand(true, true);
    this.query = query;
    this.current_page = 0;
    this.current_page_data = null;
    this.table_scroll_top = 0;
    this.table_scroll_left = 0;
  }

  isSerializable() {
    return this.query instanceof AbstractSerializableQuery;
  }

  toArray() {
    return {
      ...super.toArray(),
      current_page: this.current_page
    };
  }

  fromArray(data: ReturnType<this['toArray']>, engine: WorkspaceEngine) {
    super.fromArray(data, engine);
    this.current_page = data.current_page || 0;
  }

  encodeEntities() {
    return {
      query: this.query
    };
  }

  decodeEntities(data: ReturnType<this['encodeEntities']>) {
    this.query = data.query;
    this.current_page_data = null;
  }

  async loadSavedQuery(id: string): Promise<void> {
    const query = await ioc.get(SavedQueryStore).loadSavedQuery(id);
    if (!query) {
      return;
    }
    this.current_page = 0;
    this.current_page_data = null;
    this.query = query;
    await query.load();
  }
}

export class QueryPanelFactory extends SharedConnectionPanelFactory<QueryPanelModel> {
  static TYPE = 'query';

  constructor() {
    super({
      icon: 'table',
      color: 'rgb(0,192,255)',
      name: 'Query',
      allowManualCreation: false,
      isMultiple: true,
      fullscreen: false,
      type: QueryPanelFactory.TYPE,
      category: 'Databrowser'
    });
  }

  matchesModel(m1: QueryPanelModel, m2: QueryPanelModel) {
    return m1.query.matches(m2.query);
  }

  getSimpleName(model: QueryPanelModel): string {
    return model.query?.getSimpleName();
  }

  protected getConnection(model: QueryPanelModel): AbstractConnection | null {
    return model.query?.connection || null;
  }

  _generateModel(): QueryPanelModel {
    return new QueryPanelModel(null);
  }

  generatePanelContent(event: WorkspaceModelFactoryEvent<QueryPanelModel>): React.JSX.Element {
    return <QueryPanelWidget key={event.model.id} model={event.model} />;
  }
}
