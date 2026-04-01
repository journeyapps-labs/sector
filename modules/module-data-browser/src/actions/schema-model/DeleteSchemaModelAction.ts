import { ActionStore, EntityAction, EntityActionEvent, ioc } from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../../entities';
import { SchemaModelObject } from '../../core/SchemaModelObject';
import { deleteSchemaModels } from '../../core/delete-schema-models';

export class DeleteSchemaModelAction extends EntityAction<SchemaModelObject> {
  static ID = 'DELETE_SCHEMA_MODEL';

  constructor() {
    super({
      id: DeleteSchemaModelAction.ID,
      name: 'Delete schema model',
      icon: 'trash',
      target: DataBrowserEntities.SCHEMA_MODEL_OBJECT
    });
  }

  async fireEvent(event: EntityActionEvent<SchemaModelObject>): Promise<any> {
    await deleteSchemaModels({
      models: [event.targetEntity]
    });
  }

  static get() {
    return ioc.get(ActionStore).getActionByID<DeleteSchemaModelAction>(DeleteSchemaModelAction.ID);
  }
}
