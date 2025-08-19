import { AbstractConnectionFactory } from '../AbstractConnectionFactory';
import { ManualConnection } from './ManualConnection';
import { DialogStore2, FormDialogDirective, inject } from '@journeyapps-labs/reactor-mod';
import { APIConnectionForm } from '../../forms/APIConnectionForm';

export class ManualConnectionFactory extends AbstractConnectionFactory<ManualConnection> {
  @inject(DialogStore2)
  accessor dialogStore: DialogStore2;

  constructor() {
    super({
      key: 'MANUAL_CONNECTION',
      label: 'API Token Connection'
    });
  }

  async generateConnectionFromUI(): Promise<ManualConnection | null> {
    let result = await this.dialogStore.showDialog(
      new FormDialogDirective({
        form: new APIConnectionForm(),
        title: 'Create connection',

        // FIXME remove when the fix in Reactor is merged: https://github.com/journeyapps-labs/reactor/pull/32
        handler: async () => {}
      })
    );
    if (result) {
      return result.form.generateConnection(this);
    }
    return null;
  }

  generateConnection(): ManualConnection {
    return new ManualConnection(this);
  }
}
