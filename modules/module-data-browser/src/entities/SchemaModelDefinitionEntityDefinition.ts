import {
  EntityDefinition,
  EntityDescriberComponent,
  inject,
  InlineEntityEncoderComponent,
  InlineTreePresenterComponent,
  SimpleParentEntitySearchEngine
} from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../entities';
import { ConnectionStore } from '../stores/ConnectionStore';
import { AbstractConnection } from '../core/AbstractConnection';
import { SchemaModelDefinition } from '../core/SchemaModelDefinition';

export interface SchemaModelDefinitionEntityDefinitionEncoded {
  connection_id: string;
  type: string;
}

export class SchemaModelDefinitionEntityDefinition extends EntityDefinition<SchemaModelDefinition> {
  @inject(ConnectionStore)
  accessor connectionStore: ConnectionStore;

  constructor() {
    super({
      type: DataBrowserEntities.SCHEMA_MODEL_DEFINITION,
      category: 'DataBrowser',
      label: 'Schema model definition',
      icon: 'cube',
      iconColor: 'mediumpurple'
    });

    this.registerComponent(
      new EntityDescriberComponent<SchemaModelDefinition>({
        label: 'Simple',
        describe: (entity: SchemaModelDefinition) => {
          return {
            simpleName: entity.definition.label,
            complexName: entity.definition.name
          };
        }
      })
    );

    this.registerComponent(
      new InlineEntityEncoderComponent<SchemaModelDefinition, SchemaModelDefinitionEntityDefinitionEncoded>({
        version: 1,
        encode: (e) => {
          return {
            connection_id: e.connection.id,
            type: e.definition.name
          };
        },
        decode: async (entity) => {
          let connection = await this.connectionStore.waitForReadyForConnection(entity.connection_id);
          return connection.waitForSchemaModelDefinitionByName(entity.type);
        }
      })
    );

    this.registerComponent(new InlineTreePresenterComponent());

    this.registerComponent(
      new SimpleParentEntitySearchEngine<AbstractConnection, SchemaModelDefinition>({
        label: 'Simple',
        type: DataBrowserEntities.CONNECTION,
        getEntities: async (event) => {
          return event.parameters.parent.schema_models.items;
        }
      })
    );
  }

  matchEntity(t: any): boolean {
    if (t instanceof SchemaModelDefinition) {
      return true;
    }
  }

  getEntityUID(t: SchemaModelDefinition) {
    return t.definition.name;
  }
}
