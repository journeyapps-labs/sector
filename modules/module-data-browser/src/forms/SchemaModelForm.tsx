import { EntityInput, FormInput, FormModel, inject } from '@journeyapps-labs/reactor-mod';
import { SchemaModelDefinition } from '../core/SchemaModelDefinition';
import { SchemaModelObject } from '../core/SchemaModelObject';
import * as _ from 'lodash';
import { DataBrowserEntities } from '../entities';
import { DirtyWrapperInput } from './inputs/DirtyWrapperInput';
import { TypeEngine, TypeHandler } from './TypeEngine';
import { autorun, IReactionDisposer } from 'mobx';
import { Variable } from '@journeyapps/db';

export interface SchemaModelFormOptions {
  definition: SchemaModelDefinition;
  object?: SchemaModelObject;
}

export interface BindingOption {
  input: FormInput;
  name: string;
  model: SchemaModelObject;
  resolve: () => Promise<any>;
}

export class Binding {
  @inject(TypeEngine)
  accessor typeEngine: TypeEngine;

  setting_value_via_autorun: boolean;

  private listener1: IReactionDisposer;
  private listener2: () => any;

  constructor(protected options: BindingOption) {
    const { input, model, name } = options;
    this.setting_value_via_autorun = false;
    this.listener2 = input.registerListener({
      valueChanged: async () => {
        if (this.setting_value_via_autorun) {
          return;
        }
        model.set(input.name, await this.encode(input.value));
      }
    });
    this.listener1 = autorun(async () => {
      let value = model.patch.get(name);
      if (value == null) {
        value = await options.resolve();
      }
      this.setting_value_via_autorun = true;
      if (value == null) {
        input.setValue(null);
      } else {
        let decoded = await this.decode(value);
        input.setValue(decoded);
      }
      this.setting_value_via_autorun = false;
    });
  }

  async encode(value) {
    return value;
  }

  async decode(value) {
    return value;
  }

  get input() {
    return this.options.input;
  }

  dispose() {
    this.listener1();
    this.listener2();
  }
}

export class TypedBinding extends Binding {
  handler: TypeHandler;
  constructor(options: Omit<BindingOption & { variable: Variable }, 'resolve'>) {
    super({
      ...options,
      resolve: async () => {
        return options.model?.model[options.name];
      }
    });
    this.handler = this.typeEngine.getHandler(options.variable.type);
  }

  async encode(value) {
    return await this.handler.encode(value);
  }

  async decode(value) {
    return await this.handler.decode(value);
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

      // if (options.object?.data.belongs_to[relationship.name]) {
      //   definition.resolve(options.object?.data.belongs_to[relationship.name]).then((resolved) => {
      //     if (resolved) {
      //       entity.setValue(resolved);
      //     }
      //   });
      // }
      return new Binding({
        name: relationship.name,
        model: this.options.object,
        input: entity,
        resolve: () => {
          if (!options.object.data.belongs_to[relationship.name]) {
            return null;
          }
          return definition.resolve(options.object.data.belongs_to[relationship.name]);
        }
      });
    })
      .filter((f) => !!f)
      .forEach((binding) => {
        this.bindings.add(binding);
        this.addInput(new DirtyWrapperInput(binding.input, options.object));
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

      return new TypedBinding({
        variable: attribute,
        model: this.options.object,
        input: field,
        name: attribute.name
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
