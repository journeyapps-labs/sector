import { Location, LocationType } from '@journeyapps/db';
import { MetadataWidget } from '@journeyapps-labs/reactor-mod';
import * as React from 'react';
import { LocationInput } from '../inputs/LocationInput';
import { TypeHandler } from './shared/type-handler';

export const locationHandler: TypeHandler = {
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
};
