import { EntityAction, EntityActionEvent, inject, ioc, System } from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../../entities';
import { ConnectionStore } from '../../stores/ConnectionStore';
import { AbstractConnection } from '../../core/AbstractConnection';

export class RemoveConnectionAction extends EntityAction<AbstractConnection> {
  static ID = 'REMOVE_CONNECTION';

  @inject(ConnectionStore)
  accessor connectionStore: ConnectionStore;

  constructor() {
    super({
      id: RemoveConnectionAction.ID,
      name: 'Remove connection',
      icon: 'trash',
      target: DataBrowserEntities.CONNECTION
    });
  }

  async fireEvent(event: EntityActionEvent<AbstractConnection>): Promise<any> {
    event.targetEntity.remove();
  }

  static get() {
    return ioc.get(System).getActionByID<RemoveConnectionAction>(RemoveConnectionAction.ID);
  }
}
