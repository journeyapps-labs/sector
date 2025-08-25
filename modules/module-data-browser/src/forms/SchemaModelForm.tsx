import {
  BooleanInput,
  DateInput,
  DateTimePickerType,
  FileInput,
  FormModel,
  ImageInput,
  ImageMedia,
  SelectInput,
  TextInput
} from '@journeyapps-labs/reactor-mod';
import { SchemaModelDefinition } from '../core/SchemaModelDefinition';
import { SchemaModelObject } from '../core/SchemaModelObject';
import * as _ from 'lodash';
import {
  AttachmentType,
  BooleanType,
  DatetimeType,
  DateType,
  LocationType,
  MultipleChoiceType,
  PhotoType,
  SignatureType,
  SingleChoiceIntegerType,
  SingleChoiceType,
  TextType
} from '@journeyapps/db';
import { LocationInput } from './inputs/LocationInput';

export interface SchemaModelFormOptions {
  definition: SchemaModelDefinition;
  object?: SchemaModelObject;
}

export class SchemaModelForm extends FormModel {
  constructor(protected options: SchemaModelFormOptions) {
    super();

    _.map(options.definition.definition.attributes, (attribute) => {
      if (attribute.type instanceof DatetimeType) {
        return new DateInput({
          name: attribute.name,
          label: attribute.label,
          value: options.object?.model[attribute.name] || null,
          type: DateTimePickerType.DATETIME
        });
      }
      if (attribute.type instanceof DateType) {
        return new DateInput({
          name: attribute.name,
          label: attribute.label,
          value: options.object?.model[attribute.name] || null,
          type: DateTimePickerType.DATE
        });
      }
      if (attribute.type instanceof SignatureType || attribute.type instanceof PhotoType) {
        let media = new ImageInput({
          name: attribute.name,
          label: attribute.label
        });

        if (options.object) {
          options.object.getMedia(attribute.name).then((m) => {
            media.setValue(m as ImageMedia);
          });
        }
        return media;
      }
      if (attribute.type instanceof AttachmentType) {
        return new FileInput({
          name: attribute.name,
          label: attribute.label,
          value: options.object?.model[attribute.name] || null
        });
      }
      if (attribute.type instanceof BooleanType) {
        return new BooleanInput({
          name: attribute.name,
          label: attribute.label,
          value: options.object?.model[attribute.name]
        });
      }
      if (attribute.type instanceof LocationType) {
        return new LocationInput({
          name: attribute.name,
          label: attribute.label,
          value: options.object?.model[attribute.name]
        });
      }
      if (attribute.type instanceof SingleChoiceIntegerType || attribute.type instanceof SingleChoiceType) {
        return new SelectInput({
          name: attribute.name,
          label: attribute.label,
          value: options.object?.model[attribute.name],
          options: _.mapValues(attribute.type.options, (option) => {
            return `${option.value}`;
          })
        });
      }
      if (attribute.type instanceof MultipleChoiceType) {
      }
      if (attribute.type instanceof TextType) {
        return new TextInput({
          name: attribute.name,
          label: attribute.label,
          value: options.object?.model[attribute.name]
        });
      }
      return null;
    })
      .filter((f) => !!f)
      .forEach((a) => {
        this.addInput(a);
      });
  }
}
