import {
  Attachment,
  AttachmentType,
  BooleanType,
  DatetimeType,
  DateType,
  Day,
  Location,
  LocationType,
  NumberType,
  PhotoType,
  SignatureType,
  SingleChoiceIntegerType,
  TextType,
  Type
} from '@journeyapps/db';
import {
  AbstractMedia,
  BooleanInput,
  CheckboxWidget,
  DateInput,
  DateTimePickerType,
  FileInput,
  FormInput,
  ImageInput,
  ImageMedia,
  inject,
  MediaEngine,
  MetadataWidget,
  NumberInput,
  SelectInput,
  SmartDateDisplayWidget,
  styled,
  TableButtonWidget,
  TextAreaInput,
  TextInput,
  TextInputType
} from '@journeyapps-labs/reactor-mod';
import { LocationInput } from './inputs/LocationInput';
import * as React from 'react';
import { JSX } from 'react';
import { SchemaModelObject } from '../core/SchemaModelObject';
import * as _ from 'lodash';

export interface TypeHandler<T extends Type = Type, ENCODED = any, DECODED = any> {
  matches: (type: Type) => boolean;
  generateField: (event: { label: string; name: string; type: T }) => FormInput;
  generateDisplay: (event: {
    label: string;
    name: string;
    type: T;
    value: ENCODED;
    model: SchemaModelObject;
  }) => JSX.Element | string;
  decode: (value: ENCODED) => Promise<DECODED>;
  encode: (value: DECODED) => Promise<ENCODED>;
}

export class TypeEngine {
  handlers: Set<TypeHandler>;

  @inject(MediaEngine)
  accessor mediaEngine: MediaEngine;

  private _mediaCache: Map<string, AbstractMedia>;

  constructor() {
    this.handlers = new Set();
    this._mediaCache = new Map();
    this.register({
      matches: (type) => type instanceof DatetimeType || type instanceof DateType,
      encode: async (value: Date) => new Day(value),
      decode: async (value: Day | Date) => {
        if (value instanceof Day) {
          return value.toDate();
        }
        return value;
      },
      generateField: ({ label, name, type }) => {
        return new DateInput({
          name,
          label,
          type: type instanceof DatetimeType ? DateTimePickerType.DATETIME : DateTimePickerType.DATE
        });
      },
      generateDisplay: ({ value }) => {
        if (value instanceof Day) {
          return <SmartDateDisplayWidget date={value.toDate()} />;
        }
        return <SmartDateDisplayWidget date={value} />;
      }
    });

    this.register({
      matches: (type) => type instanceof SignatureType || type instanceof PhotoType,
      encode: async (value: ImageMedia) => {
        return Attachment.create({
          data: await value.toArrayBuffer()
        });
      },
      decode: async (value: Attachment) => {
        if (this._mediaCache.has(value.id)) {
          return this._mediaCache.get(value.id);
        }
        let media = this.mediaEngine.getMediaTypeForPath('.jpg').generateMedia({
          content: await value.toArrayBuffer(),
          name: value.id,
          uid: value.id
        });

        this._mediaCache.set(value.id, media);
        return media;
      },
      generateField: ({ label, name }) => {
        return new ImageInput({
          name,
          label
        });
      },
      generateDisplay: ({ value, type }) => {
        if (value.uploaded()) {
          return (
            <S.Preview
              onClick={() => {
                this.getHandler(type)
                  .decode(value)
                  .then((media: ImageMedia) => {
                    if (media instanceof ImageMedia) {
                      media.open();
                    } else {
                      window.open(value.url(), '_blank');
                    }
                  });
              }}
              src={value.urls['thumbnail']}
            />
          );
        }
        return <S.Empty>Not uploaded</S.Empty>;
      }
    });

    this.register({
      matches: (type) => type instanceof AttachmentType,
      encode: async (value: File) => {
        return Attachment.create({
          data: await value.arrayBuffer(),
          filename: value.name
        });
      },
      decode: async (value: Attachment) => {
        return new File([await value.toArrayBuffer()], value.id);
      },
      generateField: ({ label, name }) => {
        return new FileInput({
          name,
          label
        });
      },
      generateDisplay: ({ value, type }) => {
        return null;
      }
    });
    this.register({
      matches: (type) => type instanceof BooleanType,
      encode: async (value: boolean) => value,
      decode: async (value: boolean) => value,
      generateField: ({ label, name }) => {
        return new BooleanInput({
          name,
          label
        });
      },
      generateDisplay: ({ value, type, name, model }) => {
        return (
          <CheckboxWidget
            checked={value}
            onChange={(checked) => {
              model.set(name, checked);
            }}
          />
        );
      }
    });

    this.register({
      matches: (type) => type instanceof NumberType,
      encode: async (value: number) => value,
      decode: async (value: number) => value,
      generateField: ({ label, name }) => {
        return new NumberInput({
          name,
          label
        });
      },
      generateDisplay: ({ value, type, name, model }) => {
        return `${value}`;
      }
    });

    this.register<TextType, string, string>({
      matches: (type) => type instanceof TextType,
      encode: async (value: string) => value,
      decode: async (value: string) => value,
      generateField: ({ label, name, type }) => {
        if (type.subType == 'paragraph') {
          return new TextAreaInput({
            name,
            label
          });
        }

        if (type.subType == 'password') {
          return new TextInput({
            name,
            label,
            inputType: TextInputType.PASSWORD
          });
        }

        return new TextInput({
          name,
          label
        });
      },
      generateDisplay: ({ value, type, name, model }) => {
        if (value.trim() === '') {
          return <S.Empty>empty</S.Empty>;
        }

        if (type.subType == 'password') {
          return '****';
        }

        if (type.subType == 'paragraph') {
          // could be JSON
          if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
            try {
              let parsed = JSON.parse(value);
              return 'JSON Data {}';
            } catch (ex) {}
          }
        }

        if (type.subType == 'url') {
          return (
            <S.Container>
              {value}
              <TableButtonWidget
                icon="arrow-right"
                action={() => {
                  window.open(value, '_blank');
                }}
              />
            </S.Container>
          );
        }

        return <S.Max>{value}</S.Max>;
      }
    });
    this.register({
      matches: (type) => type instanceof LocationType,
      encode: async (value: Location) => value,
      decode: async (value: Location) => value,
      generateField: ({ label, name }) => {
        return new LocationInput({
          name,
          label
        });
      },
      generateDisplay: ({ value, type, name, model }) => {
        return (
          <>
            <MetadataWidget label={'Lat'} value={`${value.latitude}`} />
            <MetadataWidget label={'Long'} value={`${value.longitude}`} />
          </>
        );
      }
    });

    this.register({
      matches: (type) => type instanceof SingleChoiceIntegerType,
      encode: async (value: string) => parseInt(value),
      decode: async (value: number) => `${value}`,
      generateField: ({ label, name, type }) => {
        return new SelectInput({
          name,
          label,
          options: _.mapValues(type.options, (o) => `${o.value}`)
        });
      },
      generateDisplay: ({ value, type, name, model, label }) => {
        return `${value}`;
      }
    });
  }

  getHandler(type: Type) {
    for (let handler of this.handlers) {
      if (handler.matches(type)) {
        return handler;
      }
    }
    return null;
  }

  register<T extends Type = Type, ENCODED = any, DECODED = any>(handler: TypeHandler<T, ENCODED, DECODED>) {
    this.handlers.add(handler);
  }
}

namespace S {
  export const Preview = styled.img`
    max-height: 40px;
    max-width: 40px;
    cursor: pointer;
  `;

  export const Empty = styled.div`
    opacity: 0.2;
  `;

  export const Max = styled.div`
    max-width: 500px;
    white-space: pre;
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  export const Container = styled.div`
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
  `;
}
