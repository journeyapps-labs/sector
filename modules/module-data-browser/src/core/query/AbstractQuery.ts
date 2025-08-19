import { Page } from './Page';
import { AbstractConnection } from '../AbstractConnection';
import { ConnectionStore } from '../../stores/ConnectionStore';
import { v4 } from 'uuid';
import { TableColumn } from '@journeyapps-labs/reactor-mod';

export interface AbstractQueryEncoded {
  type: string;
  connection_id: string;
  definition: string;
}

export abstract class AbstractQuery<T extends AbstractQueryEncoded = AbstractQueryEncoded> {
  id: string;

  constructor(
    protected type: string,
    protected connection: AbstractConnection
  ) {
    this.id = v4();
  }

  abstract getSimpleName(): string;

  abstract load(): Promise<any>;

  abstract getColumns(): TableColumn[];

  abstract get totalPages(): number;

  abstract getPage(number: number): Page;

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
