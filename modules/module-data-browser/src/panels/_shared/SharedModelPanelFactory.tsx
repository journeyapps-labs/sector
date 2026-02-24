import { inject, ReactorPanelFactory, ReactorPanelModel, TabWidget } from '@journeyapps-labs/reactor-mod';
import { ConnectionStore } from '../../stores/ConnectionStore';
import { observable } from 'mobx';
import { SchemaModelDefinition } from '../../core/SchemaModelDefinition';
import { SchemaModelObject } from '../../core/SchemaModelObject';
import { TabRendererEvent } from '@projectstorm/react-workspaces-model-tabs';
import React from 'react';

export interface SharedModelPanelModelOptions {
  definition: SchemaModelDefinition;
  model: SchemaModelObject;
}

export class SharedModelPanelModel extends ReactorPanelModel {
  @inject(ConnectionStore)
  accessor connStore: ConnectionStore;

  @observable
  accessor definition: SchemaModelDefinition;

  @observable
  accessor model: SchemaModelObject;

  constructor(type: string, options?: SharedModelPanelModelOptions) {
    super(type);
    this.setExpand(false, true);
    this.definition = options?.definition;
    this.model = options?.model;
  }

  encodeEntities() {
    return {
      definition: this.definition,
      model: this.model?.model ? this.model : null
    };
  }

  async decodeEntities(data: ReturnType<this['encodeEntities']>) {
    this.definition = data.definition;
    this.model = data.model || (await data.definition.generateNewModelObject());
  }
}

export abstract class SharedModelPanelFactory<T extends SharedModelPanelModel> extends ReactorPanelFactory<T> {
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
          event.model.definition?.connection?.color
            ? {
                color: event.model.definition.connection.color
              }
            : undefined
        }
      />
    );
  }

  getSimpleName(model: T) {
    let _model = model.model;
    let _definition = model.definition;
    if (!_definition) {
      return super.getSimpleName(model);
    }
    if (_model) {
      return `${_definition.definition.label}: ${_model.data?.display || '(new object)'}`;
    }
    return `${_definition.definition.label}`;
  }
}
