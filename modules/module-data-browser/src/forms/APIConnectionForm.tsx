import { FormModel, TextInput, TextInputType } from '@journeyapps-labs/reactor-mod';
import { ManualConnection } from '../core/types/ManualConnection';
import { ManualConnectionFactory } from '../core/types/ManualConnectionFactory';

export interface APIConnectionFormValue {
  name: string;
  base_url: string;
  api_token: string;
}

export class APIConnectionForm extends FormModel<APIConnectionFormValue> {
  constructor(value?: APIConnectionFormValue) {
    super();

    this.addInput(
      new TextInput({
        name: 'name',
        label: 'Connection name',
        value: value?.name || 'Default'
      })
    );

    this.addInput(
      new TextInput({
        name: 'base_url',
        label: 'Base URL',
        value: value?.base_url
      })
    );

    this.addInput(
      new TextInput({
        name: 'api_token',
        label: 'API Token',
        inputType: TextInputType.PASSWORD,
        value: value?.api_token
      })
    );
  }

  generateConnection(factory: ManualConnectionFactory) {
    return new ManualConnection(factory, {
      baseUrl: this.value().base_url,
      token: this.value().api_token,
      name: this.value().name
    });
  }
}
