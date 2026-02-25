import * as React from 'react';
import styled from '@emotion/styled';
import { ObjectType, Type, Variable } from '@journeyapps/db';
import { ColumnDisplayWidget } from './ColumnDisplayWidget';
import { SmartFilterMetadataWidget, SmartFilterWidget } from './SmartFilterWidget';
import { SimpleFilter } from '../filters';
import { PanelTitleToolbarButtonWidget } from '@journeyapps-labs/reactor-mod';
import type { SortDirection } from '../query-simple/SimpleQuery';

export interface SmartColumnWidgetProps {
  variable: Variable;
  type?: ObjectType;
  filter?: SimpleFilter;
  sortDirection?: SortDirection;
  onToggleSort?: () => Promise<any> | any;
  filterChanged: (filter: SimpleFilter | null) => any;
}

export const SmartColumnWidget: React.FC<SmartColumnWidgetProps> = (props) => {
  const baseLabel = props.variable.label || props.variable.name;
  const displayLabel = props.sortDirection ? `${baseLabel} ${props.sortDirection === 'asc' ? '↑' : '↓'}` : baseLabel;
  let display = <ColumnDisplayWidget label={displayLabel} onClick={props.onToggleSort} />;
  if (props.type) {
    display = (
      <S.TypeGroup>
        {display}
        <S.Type label={props.type.label} />
      </S.TypeGroup>
    );
  }
  return (
    <S.Container>
      <S.TopRow>
        {display}
        <SmartFilterWidget filter={props.filter} variable={props.variable} filterChanged={props.filterChanged} />
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

  export const Type = styled(ColumnDisplayWidget)`
    opacity: 0.5;
  `;

  export const TypeGroup = styled.div``;

  export const FilterMetaRow = styled.div`
    display: flex;
    align-items: center;
    column-gap: 2px;
    justify-content: flex-start;
  `;
}
