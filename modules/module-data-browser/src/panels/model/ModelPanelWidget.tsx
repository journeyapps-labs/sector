import * as React from 'react';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import { BorderLayoutWidget, LoadingPanelWidget } from '@journeyapps-labs/reactor-mod';

import { SchemaModelForm } from '../../forms/SchemaModelForm';
import { ModelPanelModel } from './ModelPanelFactory';

export interface QueryPanelWidgetProps {
  model: ModelPanelModel;
}

namespace S {
  export const Container = styled.div`
    padding: 20px;
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

  return (
    <LoadingPanelWidget loading={!form}>
      {() => {
        return <S.Container>{form.render()}</S.Container>;
      }}
    </LoadingPanelWidget>
  );
});
