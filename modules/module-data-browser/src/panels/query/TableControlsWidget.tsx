import * as React from 'react';
import { ComboBoxItem, PanelButtonWidget, PanelDropdownWidget, styled } from '@journeyapps-labs/reactor-mod';
import { AbstractQuery } from '../../core/query/AbstractQuery';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import { Page } from '../../core/query/Page';

export interface TableControlsWidgetProps {
  current_page: Page;
  goToPage?: (index: number) => any;
  className?: any;
  query: AbstractQuery;
}

export const TableControlsWidget: React.FC<TableControlsWidgetProps> = observer((props) => {
  return (
    <S.Container className={props.className}>
      <PanelButtonWidget
        disabled={props.current_page?.index === 0}
        label="Prev"
        action={() => {
          props.goToPage(props.current_page.index - 1);
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
      <PanelButtonWidget
        disabled={props.query.totalPages == props.current_page.index + 1}
        label="Next"
        action={() => {
          props.goToPage(props.current_page.index + 1);
        }}
      />
      <PanelButtonWidget
        label="Page"
        icon="refresh"
        action={() => {
          props.current_page.load();
        }}
      />
      <PanelButtonWidget
        label="Query"
        icon="refresh"
        action={() => {
          props.query.load();
        }}
      />
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
}
