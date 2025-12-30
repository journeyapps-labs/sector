import { AbstractStore, LocalStorageSerializer } from '@journeyapps-labs/reactor-mod';
import { AbstractConnection, AbstractConnectionSerialized } from '../core/AbstractConnection';
import { action, computed, observable, runInAction, when } from 'mobx';
import { AbstractConnectionFactory } from '../core/AbstractConnectionFactory';

export interface ConnectionStoreSerialized {
  connections: AbstractConnectionSerialized[];
}

export class ConnectionStore extends AbstractStore<ConnectionStoreSerialized> {
  @observable
  protected accessor _connections: Set<AbstractConnection>;

  protected _connectionFactories: Map<string, AbstractConnectionFactory>;

  constructor() {
    super({
      name: 'CONNECTION_STORE',
      serializer: new LocalStorageSerializer({
        key: 'CONNECTION_STORE'
      })
    });
    this._connections = new Set<AbstractConnection>();
    this._connectionFactories = new Map<string, AbstractConnectionFactory>();
  }

  @computed get connections() {
    return Array.from(this._connections.values());
  }

  get connectionFactories() {
    return Array.from(this._connectionFactories.values());
  }

  protected serialize(): ConnectionStoreSerialized {
    return {
      connections: this.connections.map((m) => m.serialize())
    };
  }

  getConnectionByID(id: string) {
    return this.connections.find((c) => c.id === id);
  }

  async waitForReadyForConnection(id: string) {
    await when(() => {
      return !!this.getConnectionByID(id);
    });
    return this.getConnectionByID(id);
  }

  async deserializeConnection(data: AbstractConnectionSerialized) {
    let conn = this._connectionFactories.get(data.factory).generateConnection();
    conn.id = data.id;
    await conn._deSerialize(data.payload);
    return conn;
  }

  protected async deserialize(data: ConnectionStoreSerialized) {
    await runInAction(async () => {
      this._connections.clear();
      let connections = await Promise.all(
        data.connections.map((connSer) => {
          return this.deserializeConnection(connSer);
        })
      );
      connections.forEach((c) => {
        this.addConnection(c);
      });
    });
  }

  registerConnectionFactory(factory: AbstractConnectionFactory) {
    this._connectionFactories.set(factory.options.key, factory);
  }

  addConnection(connection: AbstractConnection) {
    let l1 = connection.registerListener({
      removed: () => {
        this._connections.delete(connection);
        this.save();
        l1();
      }
    });
    this._connections.add(connection);
    this.save();
    connection.init();
  }
}
