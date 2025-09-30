import { ioc, SmartDateDisplayWidget, styled } from '@journeyapps-labs/reactor-mod';
import * as _ from 'lodash';
import * as React from 'react';
import { PageRow } from '../Page';
import { TypeEngine } from '../../../forms/TypeEngine';

namespace S {
  export const Empty = styled.div`
    opacity: 0.2;
  `;

  export const pill = styled.div`
    padding: 2px 4px;
    background: ${(p) => p.theme.table.pills};
    border-radius: 3px;
    font-size: 12px;
  `;

  export const Pills = styled.div`
    display: flex;
    column-gap: 2px;
    row-gap: 2px;
  `;
}

export interface CellDisplayWidgetProps {
  row: PageRow;
  cell: any;
  name: string;
}

const MAX_NUMBER_OF_ARR_ITEMS_TO_DISPLAY = 3;

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

  if (_.isArray(cell)) {
    if (cell.length === 0) {
      return <S.Empty>empty array</S.Empty>;
    }
    let items = _.slice(cell, 0, MAX_NUMBER_OF_ARR_ITEMS_TO_DISPLAY);
    return (
      <S.Pills>
        {items.map((c) => {
          return <S.pill key={c}>{c}</S.pill>;
        })}
        {items.length !== cell.length ? '...' : null}
      </S.Pills>
    );
  }

  console.log('unknown type', cell);
  return null;
};
