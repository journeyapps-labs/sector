import * as React from 'react';
import { Page } from '../../core/query/Page';
import {
  ActionSource,
  ioc,
  LoadingPanelWidget,
  ScrollableDivCss,
  System,
  TableWidget
} from '@journeyapps-labs/reactor-mod';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import { DataBrowserEntities } from '../../entities';
import { SchemaModelObject } from '../../core/SchemaModelObject';

export interface PageResultsWidgetProps {
  page: Page;
  query: AbstractQuery;
}

export const PageResultsWidget: React.FC<PageResultsWidgetProps> = observer((props) => {
  const system = ioc.get(System);

  return (
    <LoadingPanelWidget
      loading={props.page.loading}
      children={() => {
        return (
          <S.Container>
            <TableWidget
              onContextMenu={(event, row) => {
                system
                  .getDefinition<SchemaModelObject>(DataBrowserEntities.SCHEMA_MODEL_OBJECT)
                  .showContextMenuForEntity(row.model, event);
              }}
              rows={props.page.asRows()}
              columns={props.query.getColumns()}
            />
          </S.Container>
        );
      }}
    />
  );
});

namespace S {
  export const Container = styled.div`
    overflow: auto;
    ${ScrollableDivCss};
  `;
}
