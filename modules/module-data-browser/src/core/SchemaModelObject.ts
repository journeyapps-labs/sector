import {
  ApiObjectData,
  Attachment as JAttachment,
  DatabaseAdapter,
  DatabaseObject,
  DatetimeType,
  DateType,
  Day
} from '@journeyapps/db';
import { SchemaModelDefinition } from './SchemaModelDefinition';
import { AbstractMedia, inject, MediaEngine } from '@journeyapps-labs/reactor-mod';
import { observable } from 'mobx';

export interface SchemaModelObjectOptions {
  definition: SchemaModelDefinition;
  adapter: DatabaseAdapter;
  model?: ApiObjectData;
}

export class SchemaModelObject {
  @inject(MediaEngine)
  accessor mediaEngine: MediaEngine;

  private _mediaCache: Map<string, AbstractMedia>;

  model: DatabaseObject;
  updated_at: Date;

  @observable
  accessor patch: Map<string, any>;

  constructor(public options: SchemaModelObjectOptions) {
    this._mediaCache = new Map();
    if (options.model) {
      this.model = new DatabaseObject(options.adapter, options.definition.definition, options.model.id);
      // @ts-ignore
      this.model.resolve(options.model);
      this.updated_at = new Date(options.model._updated_at);
    }
    this.patch = new Map<string, any>();
  }

  set(field: string, value: any) {
    if (this.model?.[field] === value) {
      this.patch.delete(field);
    } else {
      this.patch.set(field, value);
    }
  }

  get definition(): SchemaModelDefinition {
    return this.options.definition;
  }

  get data() {
    return this.options.model;
  }

  async getMedia(field: string) {
    if (this._mediaCache.has(field)) {
      return this._mediaCache.get(field);
    }
    let media = this.model[field] as JAttachment;
    if (!media?.uploaded()) {
      return null;
    }
    let url = new URL(media.url());
    let mediaObject = this.mediaEngine.getMediaTypeForPath(url.pathname).generateMedia({
      content: await media.toArrayBuffer(),
      name: media.id,
      uid: media.id
    });

    this._mediaCache.set(field, mediaObject);
    return mediaObject;
  }
}
