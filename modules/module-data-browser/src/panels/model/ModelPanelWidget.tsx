import * as React from 'react';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import {
  BorderLayoutWidget,
  LoadingPanelWidget,
  MetaBarWidget,
  PANEL_CONTENT_PADDING,
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
}

export const ModelPanelWidget: React.FC<QueryPanelWidgetProps> = observer((props) => {
  const [form, setForm] = useState<SchemaModelForm>(null);

  useEffect(() => {
    if (!props.model.definition) {
      return;
    }
    setForm(
      new SchemaModelForm({
        object: props.model.model,
        definition: props.model.definition
      })
    );
  }, [props.model.model, props.model.definition]);

  let top = null;
  if (props.model) {
    top = (
      <PanelToolbarWidget
        btns={[
          {
            label: 'Delete object',
            action: () => {}
          }
        ]}
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
          <BorderLayoutWidget top={top}>
            <S.Container>{form.render()}</S.Container>
          </BorderLayoutWidget>
        );
      }}
    </LoadingPanelWidget>
  );
});
