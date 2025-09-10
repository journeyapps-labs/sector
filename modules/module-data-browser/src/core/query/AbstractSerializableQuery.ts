import { ConnectionStore } from '../../stores/ConnectionStore';
import { AbstractQuery } from './AbstractQuery';

export interface AbstractQueryEncoded {
  type: string;
  connection_id: string;
  definition: string;
}

export abstract class AbstractSerializableQuery<
  T extends AbstractQueryEncoded = AbstractQueryEncoded
> extends AbstractQuery {
  serialize(): T {
    return {
      type: this.type,
      connection_id: this.connection.id
    } as T;
  }

  async deserialize(connectionStore: ConnectionStore, data: T) {
    this.connection = await connectionStore.waitForReadyForConnection(data.connection_id);
  }
}
