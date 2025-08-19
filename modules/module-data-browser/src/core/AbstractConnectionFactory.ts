import { AbstractConnection } from './AbstractConnection';

export interface ConnectionFactoryOptions {
  label: string;
  key: string;
}

export abstract class AbstractConnectionFactory<T extends AbstractConnection = AbstractConnection> {
  constructor(public options: ConnectionFactoryOptions) {}

  abstract generateConnection(): T;

  abstract generateConnectionFromUI(): Promise<T | null>;
}
