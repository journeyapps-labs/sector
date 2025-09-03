import * as React from 'react';
import styled from '@emotion/styled';
import { Variable } from '@journeyapps/db';
import { ColumnDisplayWidget } from './ColumnDisplayWidget';
import { SmartFilterWidget } from './SmartFilterWidget';
import { SimpleFilter } from '../filters';

export interface SmartColumnWidgetProps {
  variable: Variable;
  filter?: SimpleFilter;
  filterChanged: (filter: SimpleFilter | null) => any;
}

export const SmartColumnWidget: React.FC<SmartColumnWidgetProps> = (props) => {
  return (
    <S.Container>
      <ColumnDisplayWidget label={props.variable.label} />
      <SmartFilterWidget filter={props.filter} variable={props.variable} filterChanged={props.filterChanged} />
    </S.Container>
  );
};

namespace S {
  export const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
  `;
}
