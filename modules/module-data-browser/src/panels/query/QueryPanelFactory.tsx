import * as React from 'react';
import { inject, ioc, ReactorPanelFactory, ReactorPanelModel, TabWidget } from '@journeyapps-labs/reactor-mod';
import { QueryPanelWidget } from './QueryPanelWidget';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { ConnectionStore } from '../../stores/ConnectionStore';
import { observable } from 'mobx';
import { WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import { TabRendererEvent } from '@projectstorm/react-workspaces-model-tabs';
import { AbstractSerializableQuery } from '../../core/query/AbstractSerializableQuery';
import { SavedQueryStore } from '../../stores/SavedQueryStore';

export class QueryPanelModel extends ReactorPanelModel {
  @inject(ConnectionStore)
  accessor connStore: ConnectionStore;

  @observable
  accessor query: AbstractQuery;

  @observable
  accessor current_page: number;

  constructor(query: AbstractQuery) {
    super(QueryPanelFactory.TYPE);
    this.setExpand(true, true);
    this.query = query;
    this.current_page = 0;
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

  fromArray(data: ReturnType<this['toArray']>, engine) {
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
  }

  async loadSavedQuery(id: string): Promise<void> {
    const query = await ioc.get(SavedQueryStore).loadSavedQuery(id);
    if (!query) {
      return;
    }
    this.current_page = 0;
    this.query = query;
    await query.load();
  }
}

export class QueryPanelFactory extends ReactorPanelFactory<QueryPanelModel> {
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

  getSimpleName(model: QueryPanelModel): string {
    return model.query?.getSimpleName();
  }

  protected generatePanelTabInternal(event: TabRendererEvent<QueryPanelModel>) {
    return (
      <TabWidget
        icon={this.getTabIcon(event)}
        factory={this}
        engine={event.engine}
        model={event.model}
        selected={event.selected}
        title={this.getSimpleName(event.model)}
        indicator={
          event.model.query?.connection?.color
            ? {
                color: event.model.query.connection.color
              }
            : undefined
        }
      />
    );
  }

  _generateModel(): QueryPanelModel {
    return new QueryPanelModel(null);
  }

  generatePanelContent(event: WorkspaceModelFactoryEvent<QueryPanelModel>): React.JSX.Element {
    return <QueryPanelWidget key={event.model.id} model={event.model} />;
  }
}
