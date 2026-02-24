import * as React from 'react';
import styled from '@emotion/styled';
import { ObjectType, Type, Variable } from '@journeyapps/db';
import { ColumnDisplayWidget } from './ColumnDisplayWidget';
import { SmartFilterMetadataWidget, SmartFilterWidget } from './SmartFilterWidget';
import { SimpleFilter } from '../filters';
import { PanelTitleToolbarButtonWidget } from '@journeyapps-labs/reactor-mod';

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
      <S.TopRow>
        {display}
        <SmartFilterWidget filter={props.filter} variable={props.variable} filterChanged={props.filterChanged} />
      </S.TopRow>
      {props.filter ? (
        <S.FilterMetaRow>
          <SmartFilterMetadataWidget variable={props.variable} filter={props.filter} />
          <PanelTitleToolbarButtonWidget
            icon="times"
            tooltip="Clear filter"
            action={() => {
              props.filterChanged(null);
            }}
          />
        </S.FilterMetaRow>
      ) : null}
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
