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
import { SchemaModelObject } from '../core/SchemaModelObject';
import { SchemaModelDefinition } from '../core/SchemaModelDefinition';

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
            simpleName: entity.data.display,
            complexName: entity.definition.definition.label
          };
        }
      })
    );

    // this.registerComponent(
    //   new SimpleParentEntitySearchEngine<SchemaModelDefinition,SchemaModelObject>({
    //     label: 'ID',
    //     filterResultsWithMatcher: false,
    //     type: DataBrowserEntities.SCHEMA_MODEL_DEFINITION,
    //     getEntities: async (event) => {
    //       let object = await event.parameters.parent.resolve(event.value);
    //       if(object){
    //         return [object]
    //       }
    //       return []
    //     }
    //   })
    // );

    this.registerComponent(
      new SimpleParentEntitySearchEngine<SchemaModelDefinition, SchemaModelObject>({
        label: 'Label',
        type: DataBrowserEntities.SCHEMA_MODEL_DEFINITION,
        filterResultsWithMatcher: false,
        getEntities: async (event) => {
          if (!event.value) {
            return [];
          }
          return await event.parameters.parent.search(event.value);
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
          return await definition.resolve(entity.id);
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
