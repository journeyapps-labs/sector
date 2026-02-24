import {
  DescendantEntityProviderComponent,
  EntityCardsPresenterComponent,
  EntityDefinition,
  EntityDescriberComponent,
  EntityPanelComponent,
  inject,
  InlineTreePresenterComponent,
  SimpleEntitySearchEngineComponent
} from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../entities';
import { ConnectionStore } from '../stores/ConnectionStore';
import { AbstractConnection } from '../core/AbstractConnection';
import { AddConnectionAction } from '../actions/connections/AddConnectionAction';

export class ConnectionEntityDefinition extends EntityDefinition<AbstractConnection> {
  @inject(ConnectionStore)
  accessor connectionStore: ConnectionStore;

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
          return entity.name;
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
        cacheTreeEntities: true
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
              icon: 'cube',
              openDefault: true
            },
            descendants: parent.schema_models.items
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
