import { ApiCredentialOptions, Database } from '@journeyapps/db';
import { AbstractConnection } from '../AbstractConnection';
import { ManualConnectionFactory } from './ManualConnectionFactory';

export interface ManualConnectionDetails extends ApiCredentialOptions {
  name: string;
}

export class ManualConnection extends AbstractConnection {
  constructor(
    factory: ManualConnectionFactory,
    protected options?: ManualConnectionDetails
  ) {
    super(factory);
  }

  getConnection(): Promise<Database> {
    return Database.instance(this.options);
  }

  _serialize(): ManualConnectionDetails {
    return this.options;
  }

  async _deSerialize(data: ManualConnectionDetails): Promise<any> {
    this.options = data;
  }

  get name(): string {
    return this.options.name;
  }
}
