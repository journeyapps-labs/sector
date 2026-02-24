import { MultipleChoiceIntegerType } from '@journeyapps/db';
import { MultiSelectInput } from '@journeyapps-labs/reactor-mod';
import * as _ from 'lodash';
import { TypeHandler, TypeHandlerContext } from './shared/type-handler';

export const multipleChoiceIntegerHandler = (context: TypeHandlerContext): TypeHandler => {
  return {
    matches: (type) => type instanceof MultipleChoiceIntegerType,
    encode: async (value: string[]) => value.map((v) => parseInt(v)),
    decode: async (value: number[]) => value.map((v) => `${v}`),
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
