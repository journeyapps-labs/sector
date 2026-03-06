import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Page } from '../../core/query/Page';
import { themed, ioc, ScrollableDivCss, System, TableWidget, LoadingPanelWidget } from '@journeyapps-labs/reactor-mod';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { observer } from 'mobx-react';
import { DataBrowserEntities } from '../../entities';
import { SchemaModelObject } from '../../core/SchemaModelObject';

export interface PageResultsWidgetProps {
  page: Page;
  query: AbstractQuery;
  scrollTop: number;
  scrollLeft: number;
  onScroll: (offsets: { top: number; left: number }) => void;
}

export const PageResultsWidget: React.FC<PageResultsWidgetProps> = observer((props) => {
  const system = ioc.get(System);
  const rows = props.page.loading ? [] : props.page.asRows();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (ref.current.scrollTop !== props.scrollTop) {
      ref.current.scrollTop = props.scrollTop;
    }
    if (ref.current.scrollLeft !== props.scrollLeft) {
      ref.current.scrollLeft = props.scrollLeft;
    }
  }, [props.scrollLeft, props.scrollTop]);

  return (
    <S.Container
      ref={ref}
      onScroll={(event) => {
        const target = event.currentTarget;
        props.onScroll({
          top: target.scrollTop,
          left: target.scrollLeft
        });
      }}
    >
      <TableWidget
        onContextMenu={(event, row) => {
          system
            .getDefinition<SchemaModelObject>(DataBrowserEntities.SCHEMA_MODEL_OBJECT)
            .showContextMenuForEntity(row.model, event);
        }}
        rows={rows}
        columns={props.query.getColumns()}
      />
      {props.page.loading ? (
        <S.RowsLoading>
          <LoadingPanelWidget loading={true}>{() => null}</LoadingPanelWidget>
        </S.RowsLoading>
      ) : rows.length === 0 ? (
        <S.EmptyState>No results for this query</S.EmptyState>
      ) : null}
    </S.Container>
  );
});

namespace S {
  export const Container = themed.div`
    position: relative;
    overflow: auto;
    height: 100%;
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

  export const RowsLoading = themed.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 180px;
  `;
}
