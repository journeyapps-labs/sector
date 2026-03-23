import * as React from 'react';
import styled from '@emotion/styled';
import { Variable } from '@journeyapps/db';
import { ColumnDisplayWidget } from './ColumnDisplayWidget';
import { SmartFilterWidget, SmartTypeEngineFilterWidget } from './SmartFilterWidget';
import { SimpleFilter } from '../filters';
import { SortDirection } from '../query-simple/SimpleQuery';

export interface SmartColumnWidgetProps {
  variable: Variable;
  typeLabel?: string;
  filter?: SimpleFilter;
  sortDirection?: SortDirection;
  onToggleSort?: () => Promise<any> | any;
  setupFilter?: (event: {
    variable: Variable;
    filter?: SimpleFilter;
    position?: MouseEvent;
  }) => Promise<SimpleFilter | null>;
  filterChanged: (filter: SimpleFilter | null) => any;
}

export const SmartColumnWidget: React.FC<SmartColumnWidgetProps> = (props) => {
  const baseLabel = props.variable.label || props.variable.name;
  const displayLabel = props.sortDirection
    ? `${baseLabel} ${props.sortDirection === SortDirection.ASC ? '↓' : '↑'}`
    : baseLabel;
  return (
    <S.Container>
      <S.TopRow>
        <ColumnDisplayWidget label={displayLabel} secondaryLabel={props.typeLabel} onClick={props.onToggleSort} />
        {props.setupFilter ? (
          <SmartFilterWidget
            filter={props.filter}
            variable={props.variable}
            setupFilter={props.setupFilter}
            filterChanged={props.filterChanged}
          />
        ) : (
          <SmartTypeEngineFilterWidget
            filter={props.filter}
            variable={props.variable}
            filterChanged={props.filterChanged}
          />
        )}
      </S.TopRow>
    </S.Container>
  );
};

namespace S {
  export const Container = styled.div`
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 3px;
  `;

  export const TopRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  `;

  export const FilterMetaRow = styled.div`
    display: flex;
    align-items: center;
    column-gap: 2px;
    justify-content: flex-start;
  `;
}
