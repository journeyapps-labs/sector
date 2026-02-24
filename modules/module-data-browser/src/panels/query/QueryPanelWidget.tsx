import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
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
  const [displayPage, setDisplayPage] = useState<Page>(null);
  const [loading, setLoading] = useState(false);
  const displayPageRef = useRef<Page>(null);
  const pendingDisposerRef = useRef<() => void>(null);

  const setVisiblePage = (page: Page) => {
    displayPageRef.current = page;
    setDisplayPage(page);
  };

  useEffect(() => {
    if (!props.model.query) {
      return;
    }
    props.model.query.load();
  }, [props.model.query]);

  useEffect(() => {
    return autorun(() => {
      if (props.model.query) {
        const nextPage = props.model.query.getPage(props.model.current_page);
        const currentPage = displayPageRef.current;

        if (!currentPage) {
          setVisiblePage(nextPage);
          setLoading(!!nextPage?.loading);
          return;
        }

        if (nextPage === currentPage) {
          setLoading(!!nextPage.loading);
          return;
        }

        if (!nextPage.loading) {
          pendingDisposerRef.current?.();
          pendingDisposerRef.current = null;
          setVisiblePage(nextPage);
          setLoading(false);
          return;
        }

        setLoading(true);
        pendingDisposerRef.current?.();
        pendingDisposerRef.current = autorun(() => {
          if (!nextPage.loading) {
            pendingDisposerRef.current?.();
            pendingDisposerRef.current = null;
            setVisiblePage(nextPage);
            setLoading(false);
          }
        });
      }
    });
  }, [props.model.query]);

  useEffect(() => {
    return () => {
      pendingDisposerRef.current?.();
      pendingDisposerRef.current = null;
    };
  }, []);

  const activePage = displayPage || (props.model.query ? props.model.query.getPage(props.model.current_page) : null);

  return (
    <LoadingPanelWidget loading={!props.model.query || !activePage}>
      {() => {
        return (
          <S.Container>
            <BorderLayoutWidget
              top={
                <TableControlsWidget
                  query={props.model.query}
                  current_page={activePage}
                  loading={loading}
                  onLoadSavedQuery={async (id) => {
                    await props.model.loadSavedQuery(id);
                  }}
                  goToPage={(index) => {
                    props.model.current_page = index;
                  }}
                />
              }
              bottom={
                <TableControlsWidget
                  query={props.model.query}
                  current_page={activePage}
                  loading={loading}
                  onLoadSavedQuery={async (id) => {
                    await props.model.loadSavedQuery(id);
                  }}
                  goToPage={(index) => {
                    props.model.current_page = index;
                  }}
                />
              }
            >
              <PageResultsWidget query={props.model.query} page={activePage} />
            </BorderLayoutWidget>
          </S.Container>
        );
      }}
    </LoadingPanelWidget>
  );
});
