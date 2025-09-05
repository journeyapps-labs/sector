import * as React from 'react';
import { observer } from 'mobx-react';
import { PageRow } from '../Page';
import { CellDisplayWidget } from './CellDisplayWidget';
import { styled } from '@journeyapps-labs/reactor-mod';

export interface SmartCellDisplayWidgetProps {
  row: PageRow;
  cell: any;
  name: string;
}

export const SmartCellDisplayWidget: React.FC<SmartCellDisplayWidgetProps> = observer((props) => {
  let value = props.cell;
  if (props.row.model.patch.has(props.name)) {
    value = props.row.model.patch.get(props.name);
  }

  return (
    <S.Container dirty={props.row.model.patch.has(props.name)}>
      <CellDisplayWidget {...props} cell={value} />
    </S.Container>
  );
});
namespace S {
  export const Container = styled.div<{ dirty: boolean }>`
    border-left: solid 4px ${(p) => (p.dirty ? p.theme.status.success : 'transparent')};
    padding-left: 2px;
  `;
}
