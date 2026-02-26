import {
  DescendantEntityProviderComponent,
  EntityCardsPresenterComponent,
  EntityDefinition,
  EntityDescriberComponent,
  EntityPanelComponent,
  inject,
  InlineTreePresenterComponent,
  SearchableTreeSearchScope,
  SimpleEntitySearchEngineComponent
} from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../entities';
import { ConnectionStore } from '../stores/ConnectionStore';
import { AbstractConnection } from '../core/AbstractConnection';
import { AddConnectionAction } from '../actions/connections/AddConnectionAction';
import { SavedQueryEntity, SavedQueryStore } from '../stores/SavedQueryStore';

export class ConnectionEntityDefinition extends EntityDefinition<AbstractConnection> {
  @inject(ConnectionStore)
  accessor connectionStore: ConnectionStore;

  @inject(SavedQueryStore)
  accessor savedQueryStore: SavedQueryStore;

  constructor() {
    super({
      type: DataBrowserEntities.CONNECTION,
      category: 'DataBrowser',
      label: 'Connection',
      icon: 'database',
      iconColor: 'cyan'
    });

    this.registerComponent(
      new EntityDescriberComponent<AbstractConnection>({
        label: 'Simple',
        describe: (entity: AbstractConnection) => {
          return {
            ...entity.name,
            iconColor: entity.color
          };
        }
      })
    );

    this.registerComponent(
      new SimpleEntitySearchEngineComponent<AbstractConnection>({
        label: 'Simple',
        getEntities: async () => {
          return this.connectionStore.connections;
        }
      })
    );

    this.registerComponent(
      new InlineTreePresenterComponent<AbstractConnection>({
        loadChildrenAsNodesAreOpened: true,
        cacheTreeEntities: true,
        searchScope: SearchableTreeSearchScope.VISIBLE_ONLY
      })
    );

    this.registerComponent(new EntityCardsPresenterComponent<AbstractConnection>());

    this.registerComponent(
      new DescendantEntityProviderComponent<AbstractConnection>({
        descendantType: DataBrowserEntities.SCHEMA_MODEL_DEFINITION,
        generateOptions: (parent) => {
          return {
            category: {
              label: 'Models',
              icon: 'cube'
            },
            descendants: parent.schema_models.items
          };
        }
      })
    );

    this.registerComponent(
      new DescendantEntityProviderComponent<AbstractConnection, SavedQueryEntity>({
        descendantType: DataBrowserEntities.SAVED_QUERY,
        generateOptions: (parent) => {
          return {
            category: {
              label: 'Saved queries',
              icon: 'bookmark'
            },
            descendants: this.savedQueryStore.getSavedEntitiesForConnection(parent.id)
          };
        }
      })
    );

    this.registerComponent(
      new EntityPanelComponent<AbstractConnection>({
        label: 'Connections',
        getEntities: () => {
          return this.connectionStore.connections;
        },
        additionalActions: [AddConnectionAction.ID]
      })
    );
  }

  matchEntity(t: any): boolean {
    if (t instanceof AbstractConnection) {
      return true;
    }
  }

  getEntityUID(t: AbstractConnection) {
    return t.id;
  }
}
