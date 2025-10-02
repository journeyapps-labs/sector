import * as React from 'react';
import { WorkspaceEngineInterface, WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import {
  SharedModelPanelFactory,
  SharedModelPanelModel,
  SharedModelPanelModelOptions
} from '../_shared/SharedModelPanelFactory';
import { ModelJsonPanelWidget } from './ModelJsonPanelWidget';
import { observable } from 'mobx';

export interface ModelJsonPanelModelOptions extends SharedModelPanelModelOptions {
  field?: string;
}

export class ModelJsonPanelModel extends SharedModelPanelModel {
  @observable
  accessor field: string;

  constructor(options?: ModelJsonPanelModelOptions) {
    super(ModelJsonPanelFactory.TYPE, options);
    this.setExpand(true, true);
    this.field = options?.field;
  }

  toArray() {
    return {
      ...super.toArray(),
      field: this.field
    };
  }

  fromArray(payload: ReturnType<this['toArray']>, engine: WorkspaceEngineInterface) {
    super.fromArray(payload, engine);
    this.field = payload.field;
  }
}

export class ModelJsonPanelFactory extends SharedModelPanelFactory<ModelJsonPanelModel> {
  static TYPE = 'databrowser/model-json';

  constructor() {
    super({
      icon: 'cube',
      color: 'mediumpurple',
      name: 'Model',
      allowManualCreation: false,
      isMultiple: true,
      fullscreen: false,
      type: ModelJsonPanelFactory.TYPE,
      category: 'Databrowser'
    });
  }

  _generateModel(): ModelJsonPanelModel {
    return new ModelJsonPanelModel(null);
  }

  generatePanelContent(event: WorkspaceModelFactoryEvent<ModelJsonPanelModel>): React.JSX.Element {
    return <ModelJsonPanelWidget key={event.model.id} model={event.model} />;
  }
}
