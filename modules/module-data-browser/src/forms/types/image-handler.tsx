import { Attachment, PhotoType, SignatureType } from '@journeyapps/db';
import { ImageInput, ImageMedia, styled } from '@journeyapps-labs/reactor-mod';
import * as React from 'react';
import { TypeHandler, TypeHandlerContext } from './shared/type-handler';
import { TypeUI } from './shared/ui';

export const imageHandler = (context: TypeHandlerContext): TypeHandler => {
  const decode = async (value: Attachment) => {
    if (context.mediaCache.has(value.id)) {
      return context.mediaCache.get(value.id);
    }
    const media = context.mediaEngine.getMediaTypeForPath('.jpg').generateMedia({
      content: await value.toArrayBuffer(),
      name: value.id,
      uid: value.id
    });

    context.mediaCache.set(value.id, media);
    return media;
  };

  return {
    matches: (type) => type instanceof SignatureType || type instanceof PhotoType,
    encode: async (value: ImageMedia) => {
      return Attachment.create({
        data: await value.toArrayBuffer()
      });
    },
    decode,
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
              decode(value).then((media: ImageMedia) => {
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
      return <TypeUI.Empty>Not uploaded</TypeUI.Empty>;
    }
  };
};

namespace S {
  export const Preview = styled.img`
    max-height: 40px;
    max-width: 40px;
    cursor: pointer;
  `;
}
