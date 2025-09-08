import {
  Attachment,
  AttachmentType,
  BooleanType,
  DatetimeType,
  DateType,
  Day,
  LocationType,
  PhotoType,
  SignatureType,
  TextType,
  Type
} from '@journeyapps/db';
import {
  AbstractMedia,
  BooleanInput,
  DateInput,
  DateTimePickerType,
  FileInput,
  FormInput,
  ImageInput,
  ImageMedia,
  inject,
  MediaEngine,
  TextInput
} from '@journeyapps-labs/reactor-mod';
import { LocationInput } from './inputs/LocationInput';

export interface TypeHandler<T extends Type = Type, ENCODED = any, DECODED = any> {
  matches: (type: Type) => boolean;
  generateField: (event: { label: string; name: string; type: T }) => FormInput;
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
        let url = new URL(value.url());
        let media = this.mediaEngine.getMediaTypeForPath(url.pathname).generateMedia({
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
      }
    });
    this.register({
      matches: (type) => type instanceof TextType,
      encode: async (value: string) => value,
      decode: async (value: string) => value,
      generateField: ({ label, name }) => {
        return new TextInput({
          name,
          label
        });
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

  register(handler: TypeHandler) {
    this.handlers.add(handler);
  }
}
