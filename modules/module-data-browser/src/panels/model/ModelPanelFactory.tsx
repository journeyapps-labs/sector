import * as React from 'react';
import { inject, ReactorPanelFactory, ReactorPanelModel } from '@journeyapps-labs/reactor-mod';
import { ModelPanelWidget } from './ModelPanelWidget';
import { ConnectionStore } from '../../stores/ConnectionStore';
import { computed, observable } from 'mobx';
import { WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import { SchemaModelDefinition } from '../../core/SchemaModelDefinition';
import { SchemaModelObject } from '../../core/SchemaModelObject';

export interface ModelPanelModelOptions {
  definition: SchemaModelDefinition;
  model?: SchemaModelObject;
}

export class ModelPanelModel extends ReactorPanelModel {
  @inject(ConnectionStore)
  accessor connStore: ConnectionStore;

  @observable
  accessor definition: SchemaModelDefinition;

  @observable
  accessor model: SchemaModelObject;

  constructor(options?: ModelPanelModelOptions) {
    super(ModelPanelFactory.TYPE);
    this.setExpand(false, true);
    this.definition = options?.definition;
    this.model = options?.model;
  }

  encodeEntities() {
    return {
      definition: this.definition,
      model: this.model
    };
  }

  decodeEntities(data: ReturnType<this['encodeEntities']>) {
    this.definition = data.definition;
    this.model = data.model;
  }
}

export class ModelPanelFactory extends ReactorPanelFactory<ModelPanelModel> {
  static TYPE = 'databrowser/model';

  constructor() {
    super({
      icon: 'cube',
      color: 'mediumpurple',
      name: 'Model',
      allowManualCreation: false,
      isMultiple: true,
      fullscreen: false,
      type: ModelPanelFactory.TYPE,
      category: 'Databrowser'
    });
  }

  getSimpleName(model: ModelPanelModel) {
    let _model = model.model;
    let _definition = model.definition;
    if (!_definition) {
      return super.getSimpleName(model);
    }
    if (_model) {
      return `${_definition.definition.label}: ${_model.data.display}`;
    }
    return `${_definition.definition.label}`;
  }

  _generateModel(): ModelPanelModel {
    return new ModelPanelModel(null);
  }

  generatePanelContent(event: WorkspaceModelFactoryEvent<ModelPanelModel>): React.JSX.Element {
    return <ModelPanelWidget key={event.model.id} model={event.model} />;
  }
}
