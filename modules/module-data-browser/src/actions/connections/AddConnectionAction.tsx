import { EntityAction, EntityActionEvent, inject, ioc, System } from '@journeyapps-labs/reactor-mod';
import { AbstractConnectionFactory } from '../../core/AbstractConnectionFactory';
import { DataBrowserEntities } from '../../entities';
import { ConnectionStore } from '../../stores/ConnectionStore';

export class AddConnectionAction extends EntityAction<AbstractConnectionFactory> {
  static ID = 'ADD_CONNECTION';

  @inject(ConnectionStore)
  accessor connectionStore: ConnectionStore;

  constructor() {
    super({
      id: AddConnectionAction.ID,
      name: 'Add connection',
      icon: 'plus',
      target: DataBrowserEntities.CONNECTION_FACTORY,
      autoSelectIsolatedTarget: true
    });
  }

  async fireEvent(event: EntityActionEvent<AbstractConnectionFactory>): Promise<any> {
    let connection = await event.targetEntity.generateConnectionFromUI();
    if (!connection) {
      return;
    }
    this.connectionStore.addConnection(connection);
  }

  static get() {
    return ioc.get(System).getActionByID<AddConnectionAction>(AddConnectionAction.ID);
  }
}
