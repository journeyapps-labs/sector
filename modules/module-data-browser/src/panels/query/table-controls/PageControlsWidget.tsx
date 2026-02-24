import * as React from 'react';
import {
  ComboBoxItem,
  IconWidget,
  InputContainerWidget,
  PanelButtonWidget,
  PanelDropdownWidget,
  styled
} from '@journeyapps-labs/reactor-mod';
import * as _ from 'lodash';
import { AbstractQuery } from '../../../core/query/AbstractQuery';
import { Page } from '../../../core/query/Page';
import { observer } from 'mobx-react';

export interface PageControlsWidgetProps {
  query: AbstractQuery;
  currentPage: Page;
  goToPage?: (index: number) => any;
}

export const PageControlsWidget: React.FC<PageControlsWidgetProps> = observer((props) => {
  return (
    <InputContainerWidget label="Page">
      <S.Group>
        <PanelButtonWidget
          disabled={props.currentPage?.index === 0}
          label="Prev"
          action={() => {
            props.goToPage?.(props.currentPage.index - 1);
          }}
        />
        <PanelButtonWidget
          disabled={props.query.totalPages === props.currentPage.index + 1}
          label="Next"
          action={() => {
            props.goToPage?.(props.currentPage.index + 1);
          }}
        />
        <S.PageSelector>
          <PanelDropdownWidget
            onChange={({ key }) => {
              props.goToPage?.(parseInt(key));
            }}
            selected={`${props.currentPage.index}`}
            items={_.range(0, props.query.totalPages).map((r) => {
              return {
                title: `${r + 1}`,
                key: `${r}`
              } as ComboBoxItem;
            })}
          />
          <S.TotalPages>
            / {props.query.totalPages === 0 ? <S.Spinner icon="spinner" spin={true} /> : props.query.totalPages}
          </S.TotalPages>
        </S.PageSelector>
      </S.Group>
    </InputContainerWidget>
  );
});

namespace S {
  export const Group = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
    row-gap: 5px;
    flex-wrap: wrap;
  `;

  export const PageSelector = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
  `;

  export const TotalPages = styled.div`
    color: ${(p) => p.theme.text.primary};
    padding-left: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
  `;

  export const Spinner = styled(IconWidget)`
    color: ${(p) => p.theme.text.secondary};
  `;
}
