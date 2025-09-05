import * as React from 'react';
import styled from '@emotion/styled';

export interface ColumnDisplayWidgetProps {
  label: string;
  className?: any;
}

export const ColumnDisplayWidget: React.FC<ColumnDisplayWidgetProps> = (props) => {
  let parts = (props.label || '').split(' ');
  if (parts.length >= 5) {
    return (
      <S.Width className={props.className} length={150}>
        {props.label}
      </S.Width>
    );
  }
  if (parts.length >= 3) {
    return (
      <S.Width className={props.className} length={80}>
        {props.label}
      </S.Width>
    );
  }
  return <S.Span className={props.className}>{props.label}</S.Span>;
};

namespace S {
  export const Width = styled.div<{ length: number }>`
    min-width: ${(p) => p.length}px;
  `;

  export const Span = styled.div`
    white-space: nowrap;
  `;
}
