import {
  EntityDefinition,
  EntityDescriberComponent,
  inject,
  InlineEntityEncoderComponent,
  InlineTreePresenterComponent
} from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../entities';
import { ConnectionStore } from '../stores/ConnectionStore';
import { SchemaModelObject } from '../core/SchemaModelObject';

export interface SchemaModelObjectEntityDefinitionEncoded {
  connection_id: string;
  type: string;
  id: string;
}

export class SchemaModelObjectEntityDefinition extends EntityDefinition<SchemaModelObject> {
  @inject(ConnectionStore)
  accessor connectionStore: ConnectionStore;

  constructor() {
    super({
      type: DataBrowserEntities.SCHEMA_MODEL_OBJECT,
      category: 'DataBrowser',
      label: 'Schema model',
      icon: 'cube',
      iconColor: 'mediumpurple'
    });

    this.registerComponent(
      new EntityDescriberComponent<SchemaModelObject>({
        label: 'Simple',
        describe: (entity: SchemaModelObject) => {
          return {
            simpleName: entity.model.id,
            complexName: entity.definition.definition.label
          };
        }
      })
    );

    this.registerComponent(
      new InlineEntityEncoderComponent<SchemaModelObject, SchemaModelObjectEntityDefinitionEncoded>({
        version: 1,
        encode: (e) => {
          return {
            connection_id: e.definition.connection.id,
            type: e.definition.definition.name,
            id: e.model.id
          };
        },
        decode: async (entity) => {
          let connection = await this.connectionStore.waitForReadyForConnection(entity.connection_id);
          let definition = await connection.waitForSchemaModelDefinitionByName(entity.type);
          let db = await definition.getCollection();
          let model = await db.first(entity.id);
          return new SchemaModelObject({
            model,
            definition
          });
        }
      })
    );

    this.registerComponent(new InlineTreePresenterComponent<SchemaModelObject>());
  }

  matchEntity(t: any): boolean {
    if (t instanceof SchemaModelObject) {
      return true;
    }
  }

  getEntityUID(t: SchemaModelObject) {
    return t.model.id;
  }
}
