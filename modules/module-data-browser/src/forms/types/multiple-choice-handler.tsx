import { MultipleChoiceType } from '@journeyapps/db';
import { MultiSelectInput } from '@journeyapps-labs/reactor-mod';
import * as _ from 'lodash';
import { TypeHandler, TypeHandlerContext } from './shared/type-handler';

export const multipleChoiceHandler = (context: TypeHandlerContext): TypeHandler => {
  return {
    matches: (type) => type instanceof MultipleChoiceType,
    encode: async (value: string[]) => value,
    decode: async (value: string[]) => value,
    generateField: ({ label, name, type }) => {
      return new MultiSelectInput({
        name,
        label,
        options: _.mapValues(type.options, (o) => `${o.value}`)
      });
    },
    generateDisplay: ({ value }) => {
      return context.displayArray(value);
    }
  };
};
