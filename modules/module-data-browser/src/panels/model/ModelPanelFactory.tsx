import * as React from 'react';
import { ModelPanelWidget } from './ModelPanelWidget';
import { WorkspaceModelFactoryEvent } from '@projectstorm/react-workspaces-core';
import {
  SharedModelPanelFactory,
  SharedModelPanelModel,
  SharedModelPanelModelOptions
} from '../_shared/SharedModelPanelFactory';

export class ModelPanelModel extends SharedModelPanelModel {
  constructor(options?: SharedModelPanelModelOptions) {
    super(ModelPanelFactory.TYPE, options);
  }
}

export class ModelPanelFactory extends SharedModelPanelFactory<ModelPanelModel> {
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

  _generateModel(): ModelPanelModel {
    return new ModelPanelModel(null);
  }

  generatePanelContent(event: WorkspaceModelFactoryEvent<ModelPanelModel>): React.JSX.Element {
    return <ModelPanelWidget key={event.model.id} model={event.model} />;
  }
}
