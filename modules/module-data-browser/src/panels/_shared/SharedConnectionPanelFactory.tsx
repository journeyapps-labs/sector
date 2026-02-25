import { AbstractConnection } from '../../core/AbstractConnection';
import { observable } from 'mobx';
import { ReactorPanelFactory, ReactorPanelModel, TabWidget } from '@journeyapps-labs/reactor-mod';
import { TabRendererEvent } from '@projectstorm/react-workspaces-model-tabs';
import React from 'react';

export interface SharedConnectionPanelModelOptions {
  connection?: AbstractConnection;
}

export class SharedConnectionPanelModel extends ReactorPanelModel {
  @observable
  accessor connection: AbstractConnection;

  constructor(type: string, options?: SharedConnectionPanelModelOptions) {
    super(type);
    this.connection = options?.connection || null;
  }

  encodeEntities() {
    return {
      ...super.encodeEntities(),
      connection: this.connection
    };
  }

  decodeEntities(entities: ReturnType<this['encodeEntities']>) {
    this.connection = entities.connection;
  }
}

export abstract class SharedConnectionPanelFactory<
  T extends SharedConnectionPanelModel
> extends ReactorPanelFactory<T> {
  protected generatePanelTabInternal(event: TabRendererEvent<T>) {
    return (
      <TabWidget
        icon={this.getTabIcon(event)}
        factory={this}
        engine={event.engine}
        model={event.model}
        selected={event.selected}
        title={this.getSimpleName(event.model)}
        indicator={
          event.model.connection?.color
            ? {
                color: event.model.connection.color
              }
            : undefined
        }
      />
    );
  }
}
