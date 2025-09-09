import {
  CheckboxWidget,
  ImageMedia,
  ioc,
  MetadataWidget,
  SmartDateDisplayWidget,
  styled
} from '@journeyapps-labs/reactor-mod';
import { Attachment, Day, Location } from '@journeyapps/db';
import * as _ from 'lodash';
import * as React from 'react';
import { PageRow } from '../Page';
import { TypeEngine } from '../../../forms/TypeEngine';

namespace S {
  export const Empty = styled.div`
    opacity: 0.2;
  `;

  export const Preview = styled.img`
    max-height: 40px;
    max-width: 40px;
    cursor: pointer;
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

  export const Max = styled.div`
    max-width: 500px;
    white-space: pre;
    display: inline;
    overflow: hidden;
    text-overflow: ellipsis;
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
  if (_.isString(cell)) {
    if (cell.trim() === '') {
      return <S.Empty>empty</S.Empty>;
    }
    return <S.Max>{cell}</S.Max>;
  }
  if (_.isNumber(cell)) {
    return cell;
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
  if (cell instanceof Date) {
    return <SmartDateDisplayWidget date={cell} />;
  }
  if (cell instanceof Day) {
    return <SmartDateDisplayWidget date={cell.toDate()} />;
  }
  if (_.isBoolean(cell)) {
    return (
      <CheckboxWidget
        checked={cell}
        onChange={(checked) => {
          row.model.set(name, checked);
        }}
      />
    );
  }
  if (cell instanceof Location) {
    return (
      <>
        <MetadataWidget label={'Lat'} value={`${cell.latitude}`} />
        <MetadataWidget label={'Long'} value={`${cell.longitude}`} />
      </>
    );
  }
  if (cell instanceof Attachment) {
    if (cell.uploaded()) {
      return (
        <S.Preview
          onClick={() => {
            ioc
              .get(TypeEngine)
              .getHandler(row.definition.definition.attributes[name].type)
              .decode(cell)
              .then((media: ImageMedia) => {
                if (media instanceof ImageMedia) {
                  media.open();
                } else {
                  window.open(cell.url(), '_blank');
                }
              });
          }}
          src={cell.urls['thumbnail']}
        />
      );
    }
    return <S.Empty>Not uploaded</S.Empty>;
  }
  console.log('unknown type', cell);
  return null;
};
