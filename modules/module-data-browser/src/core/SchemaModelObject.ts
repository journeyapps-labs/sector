import { Attachment as JAttachment, DatabaseObject } from '@journeyapps/db';
import { SchemaModelDefinition } from './SchemaModelDefinition';
import { AbstractMedia, inject, MediaEngine } from '@journeyapps-labs/reactor-mod';

export interface SchemaModelObjectOptions {
  definition: SchemaModelDefinition;
  model?: DatabaseObject;
}

export class SchemaModelObject {
  @inject(MediaEngine)
  accessor mediaEngine: MediaEngine;

  private _mediaCache: Map<string, AbstractMedia>;

  constructor(public options: SchemaModelObjectOptions) {
    this._mediaCache = new Map();
  }

  get definition(): SchemaModelDefinition {
    return this.options.definition;
  }

  get model() {
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
