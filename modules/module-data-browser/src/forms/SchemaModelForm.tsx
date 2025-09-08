import { EntityInput, FormInput, FormModel, inject } from '@journeyapps-labs/reactor-mod';
import { SchemaModelDefinition } from '../core/SchemaModelDefinition';
import { SchemaModelObject } from '../core/SchemaModelObject';
import * as _ from 'lodash';
import { DataBrowserEntities } from '../entities';
import { DirtyWrapperInput } from './inputs/DirtyWrapperInput';
import { TypeEngine } from './TypeEngine';
import { autorun, IReactionDisposer } from 'mobx';
import { Variable } from '@journeyapps/db';

export interface SchemaModelFormOptions {
  definition: SchemaModelDefinition;
  object?: SchemaModelObject;
}

export interface BindingOption {
  input: FormInput;
  variable: Variable;
  model: SchemaModelObject;
}

export class Binding {
  @inject(TypeEngine)
  accessor typeEngine: TypeEngine;

  setting_value_via_autorun: boolean;

  private listener1: IReactionDisposer;
  private listener2: () => any;

  constructor(protected options: BindingOption) {
    const { input, model, variable } = options;
    this.setting_value_via_autorun = false;
    let handler = this.typeEngine.getHandler(variable.type);
    this.listener2 = input.registerListener({
      valueChanged: async () => {
        if (this.setting_value_via_autorun) {
          return;
        }
        model.set(input.name, await handler.encode(input.value));
      }
    });
    this.listener1 = autorun(async () => {
      let value = model.patch.get(variable.name);
      if (value == null) {
        value = model?.model[variable.name];
      }
      this.setting_value_via_autorun = true;
      if (value == null) {
        input.setValue(null);
      } else {
        let decoded = await handler.decode(value);
        input.setValue(decoded);
      }
      this.setting_value_via_autorun = false;
    });
  }

  get input() {
    return this.options.input;
  }

  dispose() {
    this.listener1();
    this.listener2();
  }
}

export class SchemaModelForm extends FormModel {
  @inject(TypeEngine)
  accessor typeEngine: TypeEngine;

  bindings: Set<Binding>;

  constructor(protected options: SchemaModelFormOptions) {
    super();
    this.bindings = new Set<Binding>();
    _.map(options.definition.definition.belongsTo, (relationship) => {
      const definition = options.definition.connection.getSchemaModelDefinitionByName(relationship.foreignType.name);

      let entity = new EntityInput({
        name: relationship.name,
        entityType: DataBrowserEntities.SCHEMA_MODEL_OBJECT,
        parent: definition,
        label: relationship.name,
        value: null
      });

      if (options.object?.data.belongs_to[relationship.name]) {
        definition.resolve(options.object?.data.belongs_to[relationship.name]).then((resolved) => {
          if (resolved) {
            entity.setValue(resolved);
          }
        });
      }
      return entity;
    })
      .filter((f) => !!f)
      .forEach((a) => {
        a.registerListener({
          valueChanged: () => {
            options.object.set(a.name, a.value);
          }
        });
        this.addInput(new DirtyWrapperInput(a, options.object));
      });

    _.map(options.definition.definition.attributes, (attribute) => {
      let field = this.typeEngine.getHandler(attribute.type)?.generateField({
        name: attribute.name,
        label: attribute.label,
        type: attribute.type
      });
      if (!field) {
        return;
      }

      return new Binding({
        variable: attribute,
        model: this.options.object,
        input: field
      });
    })
      .filter((binding) => !!binding)
      .forEach((binding) => {
        this.bindings.add(binding);
        this.addInput(new DirtyWrapperInput(binding.input, options.object));
      });
  }

  dispose() {
    this.bindings.forEach((b) => {
      b.dispose();
    });
  }
}
