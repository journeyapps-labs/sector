import { Page } from './Page';
import { AbstractConnection } from '../AbstractConnection';
import { v4 } from 'uuid';
import { TableColumn } from '@journeyapps-labs/reactor-mod';
import { SchemaModelObject } from '../SchemaModelObject';

export abstract class AbstractQuery {
  id: string;

  constructor(
    public type: string,
    public connection: AbstractConnection
  ) {
    this.id = v4();
  }

  async batchSave() {
    await this.connection.batchSave(this.getDirtyObjects());
  }

  abstract getDirtyObjects(): SchemaModelObject[];

  abstract getSimpleName(): string;

  abstract load(): Promise<any>;

  abstract getColumns(): TableColumn[];

  abstract get totalPages(): number;

  abstract getPage(number: number): Page;
}
