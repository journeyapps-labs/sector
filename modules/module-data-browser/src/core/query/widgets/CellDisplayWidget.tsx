import { ioc, SmartDateDisplayWidget, styled } from '@journeyapps-labs/reactor-mod';
import * as _ from 'lodash';
import * as React from 'react';
import { PageRow } from '../Page';
import { TypeEngine } from '../../../forms/TypeEngine';

namespace S {
  export const Empty = styled.div`
    opacity: 0.2;
  `;
}

export interface CellDisplayWidgetProps {
  row: PageRow;
  cell: any;
  name: string;
}

export const CellDisplayWidget: React.FC<CellDisplayWidgetProps> = (props) => {
  const { row, cell, name } = props;
  if (cell == null) {
    return <S.Empty>null</S.Empty>;
  }

  if (name === 'updated_at') {
    return <SmartDateDisplayWidget date={cell} />;
  }

  let display = ioc.get(TypeEngine).getHandler(row.definition.definition.attributes[name].type)?.generateDisplay({
    model: row.model,
    value: cell,
    label: row.definition.definition.attributes[name].label,
    name,
    type: row.definition.definition.attributes[name].type
  });
  if (display) {
    return display;
  }

  console.log('unknown type', cell, row.definition.definition.attributes[name].type);
  return null;
};
