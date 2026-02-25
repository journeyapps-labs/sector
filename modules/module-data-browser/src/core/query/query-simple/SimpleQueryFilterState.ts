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

  setDefinition(definition: SchemaModelDefinition | undefined) {
    const definitionChanged = this.definition?.definition?.name !== definition?.definition?.name;
    this.definition = definition;
    const hadFilters = this.simpleFilters.size > 0;
    if (definitionChanged) {
      Array.from(this.simpleFilters.values()).forEach((filter) => filter.delete());
      this.simpleFilters.clear();
    }
    if (definitionChanged || hadFilters) {
      this.iterateListeners((cb) => cb.changed?.());
    }
    return definitionChanged || hadFilters;
  }

  getFilterableFields(): { key: string; label: string }[] {
    const definition = this.definition;
    if (!definition?.definition) {
      return [];
    }
    return _.map(definition.definition.attributes, (attribute) => {
      const handler = this.typeEngine.getHandler(attribute.type);
      if (!handler?.setupFilter) {
        return null;
      }
      return {
        key: attribute.name,
        label: attribute.label || attribute.name
      };
    }).filter((v) => !!v);
  }

  getActiveFilters(): { key: string; label: string; filter: SimpleFilter }[] {
    return Array.from(this.simpleFilters.entries()).map(([variable, filter]) => {
      return {
        key: variable.name,
        label: variable.label || variable.name,
        filter
      };
    });
  }

  getFilter(field: string): SimpleFilter | undefined {
    const variable = this.resolveAttribute(field);
    if (!variable) {
      return undefined;
    }
    return this.simpleFilters.get(variable);
  }

  getSerializedFilters() {
    return Array.from(this.simpleFilters.values()).map((filter) => filter.serialize());
  }

  hydrateFilters(filters: SerializedSimpleFilter[]) {
    const definition = this.definition;
    if (!definition?.definition) {
      const changed = this.simpleFilters.size > 0;
      this.simpleFilters.clear();
      if (changed) {
        this.iterateListeners((cb) => cb.changed?.());
      }
      return;
    }
    let changed = this.simpleFilters.size > 0;
    Array.from(this.simpleFilters.values()).forEach((filter) => filter.delete());
    this.simpleFilters.clear();
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
      changed = true;
    });
    if (changed) {
      this.iterateListeners((cb) => cb.changed?.());
    }
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
    if (!variable || !filter) {
      return false;
    }
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
    const definition = this.definition;
    if (!definition?.definition) {
      return undefined;
    }
    return _.find(_.values(definition.definition.attributes), (attribute) => {
      return attribute.name === field;
    });
  }
}
