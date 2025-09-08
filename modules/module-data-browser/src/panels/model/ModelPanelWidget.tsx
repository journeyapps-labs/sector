import * as React from 'react';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import {
  BorderLayoutWidget,
  LoadingPanelWidget,
  PANEL_CONTENT_PADDING,
  PanelButtonMode,
  PanelButtonWidget,
  PanelToolbarWidget,
  ScrollableDivCss
} from '@journeyapps-labs/reactor-mod';

import { SchemaModelForm } from '../../forms/SchemaModelForm';
import { ModelPanelModel } from './ModelPanelFactory';

export interface QueryPanelWidgetProps {
  model: ModelPanelModel;
}

namespace S {
  export const Container = styled.div`
    overflow: auto;
    padding: ${PANEL_CONTENT_PADDING}px;
    ${ScrollableDivCss};
  `;

  export const Buttons = styled.div`
    display: flex;
    align-items: center;
    column-gap: 5px;
    padding: 5px;
  `;
}

export const ModelPanelWidget: React.FC<QueryPanelWidgetProps> = observer((props) => {
  const [form, setForm] = useState<SchemaModelForm>(null);

  useEffect(() => {
    if (!props.model.definition) {
      return;
    }
    let _form = new SchemaModelForm({
      object: props.model.model,
      definition: props.model.definition
    });
    setForm(_form);
    return () => {
      _form.dispose();
    };
  }, [props.model.model, props.model.definition]);

  let top = null;
  if (props.model.model) {
    top = (
      <PanelToolbarWidget
        btns={
          [
            // {
            //   label: 'Delete object',
            //   action: () => {}
            // }
          ]
        }
        meta={[
          {
            label: 'ID',
            value: props.model?.id
          }
        ]}
      />
    );
  }

  return (
    <LoadingPanelWidget loading={!form}>
      {() => {
        return (
          <BorderLayoutWidget
            top={top}
            bottom={
              <S.Buttons>
                <PanelButtonWidget
                  disabled={props.model.model.patch.size === 0}
                  label="save"
                  icon="save"
                  mode={PanelButtonMode.PRIMARY}
                  action={() => {}}
                />
                <PanelButtonWidget
                  disabled={props.model.model.patch.size === 0}
                  label="discard edits"
                  icon="save"
                  action={() => {
                    props.model.model.clearEdits();
                  }}
                />
              </S.Buttons>
            }
          >
            <S.Container>{form.render()}</S.Container>
          </BorderLayoutWidget>
        );
      }}
    </LoadingPanelWidget>
  );
});
