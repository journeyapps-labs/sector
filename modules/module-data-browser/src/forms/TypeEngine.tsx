import {
  Attachment,
  AttachmentType,
  BooleanType,
  DatetimeType,
  DateType,
  Day,
  Location,
  LocationType,
  MultipleChoiceIntegerType,
  MultipleChoiceType,
  NumberType,
  PhotoType,
  SignatureType,
  SingleChoiceIntegerType,
  SingleChoiceType,
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
  PanelButtonWidget,
  SelectInput,
  SmartDateDisplayWidget,
  styled,
  TableButtonWidget,
  TextAreaInput,
  TextInput,
  TextInputType,
  MultiSelectInput,
  WorkspaceStore
} from '@journeyapps-labs/reactor-mod';
import {} from '@journeyapps-labs/reactor-mod-editor';
import { LocationInput } from './inputs/LocationInput';
import * as React from 'react';
import { JSX } from 'react';
import { SchemaModelObject } from '../core/SchemaModelObject';
import * as _ from 'lodash';
import { ModelJsonPanelModel } from '../panels/model-json/ModelJsonPanelFactory';

const MAX_NUMBER_OF_ARR_ITEMS_TO_DISPLAY = 3;

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

  @inject(WorkspaceStore)
  accessor workspaceStore: WorkspaceStore;

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
      generateDisplay: ({ value }) => {
        return (
          <TableButtonWidget
            icon="download"
            action={() => {
              window.open(value.url(), '_blank');
            }}
          />
        );
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

              return (
                <TableButtonWidget
                  icon="code"
                  label="JSON"
                  action={() => {
                    this.workspaceStore.addModel(
                      new ModelJsonPanelModel({
                        definition: model.definition,
                        model: model,
                        field: name
                      })
                    );
                  }}
                />
              );
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
      generateDisplay: ({ value }) => {
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

    this.register({
      matches: (type) => type instanceof SingleChoiceType,
      encode: async (value: string) => value,
      decode: async (value: string) => value,
      generateField: ({ label, name, type }) => {
        return new SelectInput({
          name,
          label,
          options: _.mapValues(type.options, (o) => `${o.value}`)
        });
      },
      generateDisplay: ({ value }) => {
        return value;
      }
    });

    this.register({
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
        return this.displayArray(value);
      }
    });

    this.register({
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
        return this.displayArray(value);
      }
    });
  }

  displayArray(value: any[]) {
    if (value.length === 0) {
      return <S.Empty>empty array</S.Empty>;
    }
    let items = _.slice(value, 0, MAX_NUMBER_OF_ARR_ITEMS_TO_DISPLAY);
    return (
      <S.Pills>
        {items.map((c) => {
          return <S.pill key={c}>{c}</S.pill>;
        })}
        {items.length !== value.length ? '...' : null}
      </S.Pills>
    );
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

  export const pill = styled.div`
    padding: 2px 4px;
    background: ${(p) => p.theme.table.pills};
    border-radius: 3px;
    font-size: 12px;
  `;

  export const Pills = styled.div`
    display: flex;
    column-gap: 2px;
    row-gap: 2px;
  `;
}
