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
  const hasCurrentPage = !!props.currentPage;
  const currentPageIndex = props.currentPage?.index ?? 0;

  return (
    <InputContainerWidget label="Page">
      <S.Group>
        <PanelButtonWidget
          disabled={!hasCurrentPage || currentPageIndex === 0}
          label="Prev"
          action={() => {
            if (!hasCurrentPage) {
              return;
            }
            props.goToPage?.(currentPageIndex - 1);
          }}
        />
        <PanelButtonWidget
          disabled={!hasCurrentPage || props.query.totalPages === currentPageIndex + 1}
          label="Next"
          action={() => {
            if (!hasCurrentPage) {
              return;
            }
            props.goToPage?.(currentPageIndex + 1);
          }}
        />
        <S.PageSelector>
          <PanelDropdownWidget
            onChange={({ key }) => {
              props.goToPage?.(parseInt(key));
            }}
            selected={`${currentPageIndex}`}
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
