import { Variable } from '@journeyapps/db';
import * as _ from 'lodash';
import { BaseObserver } from '@journeyapps-labs/common-utils';
import { SchemaModelDefinition } from '../../SchemaModelDefinition';
import { SerializedSimpleFilter, SimpleFilter } from '../filters';
import { TypeEngine } from '../../../forms/TypeEngine';

export interface SimpleQueryFilterStateListener {
  changed: () => any;
}

export interface SimpleQueryFilterStateOptions {
  definition?: SchemaModelDefinition;
  typeEngine: TypeEngine;
}

export interface ActiveFilterEntry {
  variable: Variable;
  filter: SimpleFilter;
}

export class SimpleQueryFilterState extends BaseObserver<SimpleQueryFilterStateListener> {
  readonly simpleFilters: Map<Variable, SimpleFilter>;
  accessor definition: SchemaModelDefinition | undefined;
  readonly typeEngine: TypeEngine;

  constructor(options: SimpleQueryFilterStateOptions) {
    super();
    this.simpleFilters = new Map();
    this.definition = options.definition;
    this.typeEngine = options.typeEngine;
  }

  get filters(): SimpleFilter[] {
    return Array.from(this.simpleFilters.values());
  }

  clear() {
    this.filters.forEach((filter) => filter.delete());
  }

  setDefinition(definition: SchemaModelDefinition | undefined) {
    const definitionChanged = this.definition?.definition?.name !== definition?.definition?.name;
    this.definition = definition;
    const hadFilters = this.simpleFilters.size > 0;
    if (definitionChanged) {
      this.clear();
    }
    if (definitionChanged && !hadFilters) {
      this.iterateListeners((cb) => cb.changed?.());
    }
    return definitionChanged || hadFilters;
  }

  getFilterableFields(): { key: string; label: string }[] {
    if (!this.definition?.definition) {
      return [];
    }
    return this.definition.getFilterableFields(this.typeEngine);
  }

  getActiveFilters(): ActiveFilterEntry[] {
    return Array.from(this.simpleFilters.entries()).map(([variable, filter]) => {
      return {
        variable,
        filter
      };
    });
  }

  getFilter(field: string): SimpleFilter | undefined {
    const variable = this.resolveAttribute(field);
    return variable ? this.simpleFilters.get(variable) : undefined;
  }

  getSerializedFilters() {
    return this.filters.map((filter) => filter.serialize());
  }

  hydrateFilters(filters: SerializedSimpleFilter[]) {
    this.clear();
    const definition = this.definition;
    if (!definition?.definition) {
      return;
    }
    (filters || []).forEach((filter) => {
      if (!SimpleFilter.canDeserialize(filter)) {
        return;
      }
      const variable = _.find(_.values(definition.definition.attributes), (attribute) => {
        return attribute.name === filter.variable;
      });
      if (!variable) {
        return;
      }
      this.addFilter(variable, SimpleFilter.deserialize(variable, filter));
    });
  }

  setFilter(field: string, filter: SimpleFilter) {
    const variable = this.resolveAttribute(field);
    if (!variable) {
      return false;
    }
    return this.addFilter(variable, filter);
  }

  async setupFilterForField(field: string, position?: MouseEvent): Promise<boolean> {
    const variable = this.resolveAttribute(field);
    if (!variable) {
      return false;
    }
    const handler = this.typeEngine.getHandler(variable.type);
    if (!handler?.setupFilter) {
      return false;
    }
    const existing = this.simpleFilters.get(variable);
    const nextFilter = await handler.setupFilter({
      variable,
      filter: existing,
      position
    });
    if (!nextFilter) {
      return false;
    }
    return this.addFilter(variable, nextFilter);
  }

  private addFilter(variable: Variable, filter: SimpleFilter): boolean {
    const existing = this.simpleFilters.get(variable);
    if (existing && existing !== filter) {
      existing.delete();
    }
    if (existing === filter) {
      this.iterateListeners((cb) => cb.changed?.());
      return true;
    }
    let unsubscribe = filter.registerListener({
      removeRequested: () => {
        unsubscribe();
        if (this.simpleFilters.get(variable) === filter) {
          this.simpleFilters.delete(variable);
          this.iterateListeners((cb) => cb.changed?.());
        }
      }
    });
    this.simpleFilters.set(variable, filter);
    this.iterateListeners((cb) => cb.changed?.());
    return true;
  }

  private resolveAttribute(field: string): Variable | undefined {
    if (!this.definition?.definition) {
      return undefined;
    }
    return _.find(_.values(this.definition.definition.attributes), (attribute) => {
      return attribute.name === field;
    });
  }
}
