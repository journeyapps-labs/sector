import { ApiObjectData, Attachment as JAttachment, DatabaseAdapter, DatabaseObject } from '@journeyapps/db';
import { SchemaModelDefinition } from './SchemaModelDefinition';
import { AbstractMedia, inject, MediaEngine } from '@journeyapps-labs/reactor-mod';
import { action, observable } from 'mobx';

export interface SchemaModelObjectOptions {
  definition: SchemaModelDefinition;
  adapter: DatabaseAdapter;
  model?: ApiObjectData;
}

export class SchemaModelObject {
  @inject(MediaEngine)
  accessor mediaEngine: MediaEngine;

  private _mediaCache: Map<string, AbstractMedia>;

  @observable
  accessor data: ApiObjectData;

  @observable
  accessor model: DatabaseObject;

  @observable
  updated_at: Date;

  @observable
  accessor patch: Map<string, any>;

  constructor(public options: SchemaModelObjectOptions) {
    this._mediaCache = new Map();
    if (options.model) {
      this.setData(options.model);
    }
    this.patch = new Map<string, any>();
  }

  clearEdits() {
    this.patch.clear();
  }

  revert(field: string) {
    this.patch.delete(field);
  }

  set(field: string, value: any) {
    if (this.model?.[field] === value) {
      this.patch.delete(field);
    } else {
      this.patch.set(field, value);
    }
  }

  @action setData(data: ApiObjectData) {
    this.data = data;
    this.model = new DatabaseObject(this.options.adapter, this.definition.definition, data.id);
    // @ts-ignore
    this.model.resolve(data);
    this.updated_at = new Date(data._updated_at);
  }

  get definition(): SchemaModelDefinition {
    return this.options.definition;
  }

  get id() {
    return this.data.id;
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
