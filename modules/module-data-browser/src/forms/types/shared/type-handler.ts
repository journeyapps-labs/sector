import { Type, Variable } from '@journeyapps/db';
import { FormInput } from '@journeyapps-labs/reactor-mod';
import { JSX } from 'react';
import { SchemaModelObject } from '../../../core/SchemaModelObject';
import { AbstractMedia, MediaEngine, WorkspaceStore } from '@journeyapps-labs/reactor-mod';
import { SimpleFilter } from '../../../core/query/filters';

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
  setupFilter?: (event: {
    variable: Variable;
    filter?: SimpleFilter;
    position?: MouseEvent;
  }) => Promise<SimpleFilter | null>;
}

export interface TypeHandlerContext {
  mediaEngine: MediaEngine;
  workspaceStore: WorkspaceStore;
  mediaCache: Map<string, AbstractMedia>;
  displayArray: (value: any[]) => JSX.Element | string;
}
