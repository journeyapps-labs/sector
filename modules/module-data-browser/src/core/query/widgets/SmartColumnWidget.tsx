import * as React from 'react';
import styled from '@emotion/styled';
import { ObjectType, Type, Variable } from '@journeyapps/db';
import { ColumnDisplayWidget } from './ColumnDisplayWidget';
import { SmartFilterWidget } from './SmartFilterWidget';
import { SimpleFilter } from '../filters';

export interface SmartColumnWidgetProps {
  variable: Variable;
  type?: ObjectType;
  filter?: SimpleFilter;
  filterChanged: (filter: SimpleFilter | null) => any;
}

export const SmartColumnWidget: React.FC<SmartColumnWidgetProps> = (props) => {
  let display = <ColumnDisplayWidget label={props.variable.label || props.variable.name} />;
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
      {display}
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

  export const Type = styled(ColumnDisplayWidget)`
    opacity: 0.5;
  `;

  export const TypeGroup = styled.div``;
}
