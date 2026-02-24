import * as React from 'react';
import { useEffect, useState } from 'react';
import { QueryPanelModel } from './QueryPanelFactory';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import { BorderLayoutWidget, LoadingPanelWidget } from '@journeyapps-labs/reactor-mod';
import { Page } from '../../core/query/Page';
import { PageResultsWidget } from './PageResultsWidget';
import { TableControlsWidget } from './TableControlsWidget';
import { autorun } from 'mobx';

export interface QueryPanelWidgetProps {
  model: QueryPanelModel;
}

namespace S {
  export const Container = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
  `;
}

export const QueryPanelWidget: React.FC<QueryPanelWidgetProps> = observer((props) => {
  const [page, setPage] = useState<Page>(null);
  useEffect(() => {
    if (!props.model.query) {
      return;
    }
    props.model.query.load();
  }, [props.model.query]);

  useEffect(() => {
    return autorun(() => {
      if (props.model.query) {
        setPage(props.model.query.getPage(props.model.current_page));
      }
    });
  }, [props.model.query]);

  return (
    <LoadingPanelWidget loading={!props.model.query || !page}>
      {() => {
        return (
          <S.Container>
            <BorderLayoutWidget
              top={
                <TableControlsWidget
                  query={props.model.query}
                  current_page={page}
                  onLoadSavedQuery={async (id) => {
                    await props.model.loadSavedQuery(id);
                    setPage(props.model.query.getPage(0));
                  }}
                  goToPage={(index) => {
                    setPage(props.model.query.getPage(index));
                    props.model.current_page = index;
                  }}
                />
              }
              bottom={
                <TableControlsWidget
                  query={props.model.query}
                  current_page={page}
                  onLoadSavedQuery={async (id) => {
                    await props.model.loadSavedQuery(id);
                    setPage(props.model.query.getPage(0));
                  }}
                  goToPage={(index) => {
                    setPage(props.model.query.getPage(index));
                    props.model.current_page = index;
                  }}
                />
              }
            >
              <PageResultsWidget query={props.model.query} page={page} />
            </BorderLayoutWidget>
          </S.Container>
        );
      }}
    </LoadingPanelWidget>
  );
});
