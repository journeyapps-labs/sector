import * as React from 'react';
import {
  ComboBoxItem,
  ComboBoxStore2,
  DialogStore,
  InputContainerWidget,
  ioc,
  PanelButtonWidget,
  PanelDropdownWidget,
  SimpleComboBoxDirective,
  styled,
  theme,
  ThemeStore,
  WorkspaceStore
} from '@journeyapps-labs/reactor-mod';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import { Page } from '../../core/query/Page';
import { ChangedModelQuery } from '../../core/query/query-changed/ChangedModelQuery';
import { SimpleQuery } from '../../core/query/query-simple/SimpleQuery';
import { SavedQueryStore } from '../../stores/SavedQueryStore';
import { QueryPanelModel } from './QueryPanelFactory';

export interface TableControlsWidgetProps {
  current_page: Page;
  goToPage?: (index: number) => any;
  className?: any;
  query: AbstractQuery;
  onLoadSavedQuery?: (id: string) => Promise<any> | any;
}

export const TableControlsWidget: React.FC<TableControlsWidgetProps> = observer((props) => {
  const _theme = ioc.get(ThemeStore).getCurrentTheme(theme);
  const savedQueryStore = ioc.get(SavedQueryStore);
  const dirtyObjects = props.query.getDirtyObjects();
  const simpleQuery = props.query instanceof SimpleQuery ? props.query : null;
  const savedQueries = simpleQuery ? savedQueryStore.getSavedForQuery(simpleQuery) : [];
  const activeSavedQuery =
    simpleQuery &&
    (savedQueries.find((saved) => {
      return _.isEqual(saved.query, simpleQuery.serialize());
    }) ||
      null);

  const showSavedQueryMenu = async (event: React.MouseEvent<any>) => {
    if (!simpleQuery) {
      return;
    }

    const queryChildren: ComboBoxItem[] =
      savedQueries.length > 0
        ? savedQueries.map((saved) => {
            return {
              title: saved.name,
              key: `query-${saved.id}`,
              icon: 'search',
              action: async () => {
                await props.onLoadSavedQuery?.(saved.id);
              }
            } as ComboBoxItem;
          })
        : [
            {
              title: 'No saved queries',
              key: 'no-queries',
              disabled: true
            } as ComboBoxItem
          ];

    const deleteChildren: ComboBoxItem[] =
      savedQueries.length > 0
        ? savedQueries.map((saved) => {
            return {
              title: saved.name,
              key: `delete-${saved.id}`,
              icon: 'trash',
              action: async () => {
                await savedQueryStore.removeSavedQuery(saved.id);
              }
            } as ComboBoxItem;
          })
        : [
            {
              title: 'No saved queries',
              key: 'no-delete-queries',
              disabled: true
            } as ComboBoxItem
          ];

    const directive = await ioc.get(ComboBoxStore2).show(
      new SimpleComboBoxDirective({
        title: 'Saved queries',
        event: event as any,
        items: [
          {
            title: 'Save query',
            key: 'save-query',
            icon: 'bookmark',
            action: async () => {
              const suggestedName = `${simpleQuery.options.definition.definition.label} query`;
              const name = await ioc.get(DialogStore).showInputDialog({
                title: 'Save query',
                initialValue: suggestedName
              });
              if (!name) {
                return;
              }
              await savedQueryStore.saveQuery(name, simpleQuery);
            }
          },
          {
            title: 'Queries',
            key: 'queries',
            icon: 'list',
            children: queryChildren
          },
          {
            title: 'Delete query',
            key: 'delete-query',
            icon: 'trash',
            children: deleteChildren
          }
        ]
      })
    );
    directive.getSelectedItem();
  };

  return (
    <S.Container className={props.className}>
      <InputContainerWidget label="Page">
        <S.Group>
          <PanelButtonWidget
            disabled={props.current_page?.index === 0}
            label="Prev"
            action={() => {
              props.goToPage(props.current_page.index - 1);
            }}
          />
          <PanelButtonWidget
            disabled={props.query.totalPages == props.current_page.index + 1}
            label="Next"
            action={() => {
              props.goToPage(props.current_page.index + 1);
            }}
          />
          <S.PageSelector>
            <PanelDropdownWidget
              onChange={({ key }) => {
                props.goToPage(parseInt(key));
              }}
              selected={`${props.current_page.index}`}
              items={_.range(0, props.query.totalPages).map((r) => {
                return {
                  title: `${r + 1}`,
                  key: `${r}`
                } as ComboBoxItem;
              })}
            />
            <S.TotalPages>/ {props.query.totalPages}</S.TotalPages>
          </S.PageSelector>
        </S.Group>
      </InputContainerWidget>

      <InputContainerWidget label="Query">
        <S.Group>
          <PanelButtonWidget
            tooltip="Reload query"
            icon="refresh"
            action={async () => {
              await props.query.load();
            }}
          />
          {simpleQuery ? (
            <PanelButtonWidget
              tooltip={activeSavedQuery ? `Saved query active: ${activeSavedQuery.name}` : 'Unsaved or modified query'}
              icon="bookmark"
              highlight={!!activeSavedQuery}
              action={async (event) => {
                await showSavedQueryMenu(event as any);
              }}
            />
          ) : null}
        </S.Group>
      </InputContainerWidget>
      {dirtyObjects.length > 0 ? (
        <InputContainerWidget label="Changes">
          <S.Group>
            <PanelButtonWidget
              label={`Save all [${dirtyObjects.length}]`}
              icon="save"
              iconColor={_theme.status.success}
              action={async () => {
                props.query.batchSave();
              }}
            />
            <PanelButtonWidget
              tooltip="Discard all edits"
              icon="arrow-rotate-back"
              action={() => {
                props.current_page.reset();
              }}
            />
            {props.query instanceof SimpleQuery ? (
              <PanelButtonWidget
                tooltip="View changed models"
                icon="eye"
                action={() => {
                  ioc
                    .get(WorkspaceStore)
                    .addModel(new QueryPanelModel(new ChangedModelQuery(props.query as SimpleQuery)));
                }}
              />
            ) : null}
          </S.Group>
        </InputContainerWidget>
      ) : null}
    </S.Container>
  );
});
namespace S {
  export const Container = styled.div`
    display: flex;
    flex-direction: row;
    column-gap: 20px;
    padding: 5px 5px;
    align-items: center;
    flex-wrap: wrap;
  `;

  export const Group = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  `;

  export const PageSelector = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
  `;

  export const TotalPages = styled.div`
    color: ${(p) => p.theme.text.primary};
    padding-left: 5px;
  `;
}
