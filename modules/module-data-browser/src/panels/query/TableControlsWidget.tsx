import * as React from 'react';
import {
  ComboBoxItem,
  ioc,
  PanelButtonWidget,
  PanelDropdownWidget,
  setupTooltipProps,
  styled,
  theme,
  ThemeStore,
  TooltipPosition,
  WorkspaceStore
} from '@journeyapps-labs/reactor-mod';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import { Page } from '../../core/query/Page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimplePage } from '../../core/query/query-simple/SimplePage';
import { QueryPanelModel } from './QueryPanelFactory';
import { ChangedModelQuery } from '../../core/query/query-changed/ChangedModelQuery';
import { SimpleQuery } from '../../core/query/query-simple/SimpleQuery';

export interface TableControlsWidgetProps {
  current_page: Page;
  goToPage?: (index: number) => any;
  className?: any;
  query: AbstractQuery;
}

export const TableControlsWidget: React.FC<TableControlsWidgetProps> = observer((props) => {
  const _theme = ioc.get(ThemeStore).getCurrentTheme(theme);
  const dirtyObjects = props.query.getDirtyObjects();
  return (
    <S.Container className={props.className}>
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
      {props.current_page instanceof SimplePage ? (
        <PanelButtonWidget
          label="Page"
          tooltip="Reload page"
          icon="refresh"
          action={async () => {
            await (props.current_page as SimplePage).load();
          }}
        />
      ) : null}
      <PanelButtonWidget
        tooltip="Reload Query"
        icon="refresh"
        action={async (event, loading) => {
          await props.query.load();
        }}
      />
      {dirtyObjects.length > 0 ? (
        <>
          <PanelButtonWidget
            label={`Save all [${dirtyObjects.length}]`}
            icon="save"
            iconColor={_theme.status.success}
            action={async (event, loading) => {}}
          />
          <span
            {...setupTooltipProps({
              tooltip: 'Discard all edits',
              tooltipPos: TooltipPosition.RIGHT
            })}
          >
            <S.RevertButton
              icon="arrow-rotate-back"
              onClick={() => {
                props.current_page.reset();
              }}
            />
          </span>
          {props.query instanceof SimpleQuery ? (
            <span
              {...setupTooltipProps({
                tooltip: 'View changed models',
                tooltipPos: TooltipPosition.RIGHT
              })}
            >
              <S.RevertButton
                icon="eye"
                onClick={() => {
                  ioc
                    .get(WorkspaceStore)
                    .addModel(new QueryPanelModel(new ChangedModelQuery(props.query as SimpleQuery)));
                }}
              />
            </span>
          ) : null}
        </>
      ) : null}
    </S.Container>
  );
});
namespace S {
  export const Container = styled.div`
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    padding: 5px 5px;
    align-items: center;
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

  export const RevertButton = styled(FontAwesomeIcon)`
    color: ${(p) => p.theme.status.success};
    font-size: 12px;
    padding: 5px;
    cursor: pointer;
  `;
}
