import {
  BooleanInput,
  DateInput,
  DateTimePickerType,
  EntityInput,
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
  Day,
  LocationType,
  MultipleChoiceType,
  PhotoType,
  SignatureType,
  SingleChoiceIntegerType,
  SingleChoiceType,
  TextType
} from '@journeyapps/db';
import { LocationInput } from './inputs/LocationInput';
import { DataBrowserEntities } from '../entities';
import { DirtyWrapperInput } from './inputs/DirtyWrapperInput';

export interface SchemaModelFormOptions {
  definition: SchemaModelDefinition;
  object?: SchemaModelObject;
}

export class SchemaModelForm extends FormModel {
  constructor(protected options: SchemaModelFormOptions) {
    super();

    _.map(options.definition.definition.belongsTo, (relationship) => {
      const definition = options.definition.connection.getSchemaModelDefinitionByName(relationship.foreignType.name);

      let entity = new EntityInput({
        name: relationship.name,
        entityType: DataBrowserEntities.SCHEMA_MODEL_OBJECT,
        parent: definition,
        label: relationship.name,
        value: null
      });

      if (options.object?.data.belongs_to[relationship.name]) {
        definition.resolve(options.object?.data.belongs_to[relationship.name]).then((resolved) => {
          if (resolved) {
            entity.setValue(resolved);
          }
        });
      }
      return entity;
    })
      .filter((f) => !!f)
      .forEach((a) => {
        this.addInput(new DirtyWrapperInput(a));
      });

    _.map(options.definition.definition.attributes, (attribute) => {
      if (attribute.type instanceof DatetimeType || attribute.type instanceof DateType) {
        let date = options.object?.model[attribute.name] || null;
        if (date && date instanceof Day) {
          date = date.toDate();
        }

        return new DateInput({
          name: attribute.name,
          label: attribute.label,
          value: date,
          type: attribute.type instanceof DatetimeType ? DateTimePickerType.DATETIME : DateTimePickerType.DATE
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
        a.registerListener({
          valueChanged: () => {
            options.object.set(a.name, a.value);
          }
        });
        this.addInput(new DirtyWrapperInput(a, options.object));
      });
  }
}
