import { BooleanType } from '@journeyapps/db';
import { BooleanInput, CheckboxWidget } from '@journeyapps-labs/reactor-mod';
import * as React from 'react';
import { TypeHandler } from './shared/type-handler';

export const booleanHandler: TypeHandler = {
  matches: (type) => type instanceof BooleanType,
  encode: async (value: boolean) => value,
  decode: async (value: boolean) => value,
  encodeToScalar: async (value: boolean) => value,
  decodeFromScalar: async (value) => value === true || value === 'true',
  generateField: ({ label, name }) => {
    return new BooleanInput({
      name,
      label
    });
  },
  generateDisplay: ({ value, name, model }) => {
    return (
      <CheckboxWidget
        checked={value}
        onChange={(checked) => {
          model.set(name, checked);
        }}
      />
    );
  }
};
