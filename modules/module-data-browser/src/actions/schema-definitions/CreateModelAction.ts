import { EntityAction, EntityActionEvent, inject, ioc, System, WorkspaceStore } from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../../entities';
import { SchemaModelDefinition } from '../../core/SchemaModelDefinition';
import { ModelPanelModel } from '../../panels/model/ModelPanelFactory';

export class CreateModelAction extends EntityAction<SchemaModelDefinition> {
  static ID = 'CREATE_SCHEMA_MODEL';

  @inject(WorkspaceStore)
  accessor workspaceStore: WorkspaceStore;

  constructor() {
    super({
      id: CreateModelAction.ID,
      name: 'Create schema model',
      icon: 'search',
      target: DataBrowserEntities.SCHEMA_MODEL_DEFINITION
    });
  }

  async fireEvent(event: EntityActionEvent<SchemaModelDefinition>): Promise<any> {
    this.workspaceStore.addModel(
      new ModelPanelModel({
        definition: event.targetEntity
      })
    );
  }

  static get() {
    return ioc.get(System).getActionByID<CreateModelAction>(CreateModelAction.ID);
  }
}
