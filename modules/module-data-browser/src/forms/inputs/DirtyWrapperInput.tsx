import { FormInput, FormInputRenderOptions, styled } from '@journeyapps-labs/reactor-mod';
import * as React from 'react';
import { SchemaModelObject } from '../../core/SchemaModelObject';
import { computed } from 'mobx';
import { observer } from 'mobx-react';

export class DirtyWrapperInput extends FormInput {
  constructor(
    public input: FormInput,
    public object?: SchemaModelObject
  ) {
    super({
      ...input.options
    });
    input.registerListener({
      valueChanged: () => {
        this.setValue(input.value);
      },
      errorChanged: () => {
        this.setError(input.error);
      }
    });
  }

  @computed get dirty() {
    return this.object?.patch.has(this.input.name);
  }

  renderControl(options: FormInputRenderOptions): React.JSX.Element {
    return <Wrapper input={this}>{this.input.renderControl(options)}</Wrapper>;
  }
}

export interface WrapperProps {
  input: DirtyWrapperInput;
}

export const Wrapper: React.FC<React.PropsWithChildren<WrapperProps>> = observer((props) => {
  return <S.Container dirty={props.input.dirty}>{props.children}</S.Container>;
});
namespace S {
  export const Container = styled.div<{ dirty: boolean }>`
    border-left: solid 4px ${(p) => (p.dirty ? p.theme.status.success : 'transparent')};
    padding-left: 2px;
  `;
}
