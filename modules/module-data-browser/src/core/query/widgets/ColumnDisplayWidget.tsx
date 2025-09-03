import * as React from 'react';
import styled from '@emotion/styled';

export interface ColumnDisplayWidgetProps {
  label: string;
}

export const ColumnDisplayWidget: React.FC<ColumnDisplayWidgetProps> = (props) => {
  let parts = (props.label || '').split(' ');
  if (parts.length >= 5) {
    return <S.Width length={150}>{props.label}</S.Width>;
  }
  if (parts.length >= 3) {
    return <S.Width length={80}>{props.label}</S.Width>;
  }
  return props.label;
};

namespace S {
  export const Width = styled.div<{ length: number }>`
    min-width: ${(p) => p.length}px;
  `;
}
