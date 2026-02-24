import * as React from 'react';
import { Page } from '../../core/query/Page';
import { themed, ioc, LoadingPanelWidget, ScrollableDivCss, System, TableWidget } from '@journeyapps-labs/reactor-mod';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { observer } from 'mobx-react';
import { DataBrowserEntities } from '../../entities';
import { SchemaModelObject } from '../../core/SchemaModelObject';

export interface PageResultsWidgetProps {
  page: Page;
  query: AbstractQuery;
}

export const PageResultsWidget: React.FC<PageResultsWidgetProps> = observer((props) => {
  const system = ioc.get(System);
  const rows = props.page.asRows();

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
              rows={rows}
              columns={props.query.getColumns()}
            />
            {rows.length === 0 ? <S.EmptyState>No results for this query</S.EmptyState> : null}
          </S.Container>
        );
      }}
    />
  );
});

namespace S {
  export const Container = themed.div`
    position: relative;
    overflow: auto;
    ${ScrollableDivCss};
  `;

  export const EmptyState = themed.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 180px;
    color: ${(p) => p.theme.text.secondary};
    font-size: 14px;
    font-weight: 500;
  `;
}
