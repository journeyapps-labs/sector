import { TextType, Variable } from '@journeyapps/db';

export enum StandardModelFields {
  ID = 'id',
  UPDATED_AT = 'updated_at'
}

export const STANDARD_MODEL_FIELD_LABELS: Record<StandardModelFields, string> = {
  [StandardModelFields.ID]: 'ID',
  [StandardModelFields.UPDATED_AT]: 'Updated at'
};

export const idVariable = new Variable(StandardModelFields.ID, new TextType()) as Variable & {
  label?: string;
};

idVariable.label = STANDARD_MODEL_FIELD_LABELS[StandardModelFields.ID];
