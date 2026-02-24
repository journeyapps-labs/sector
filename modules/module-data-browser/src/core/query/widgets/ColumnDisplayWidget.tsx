import * as React from 'react';
import styled from '@emotion/styled';

export interface ColumnDisplayWidgetProps {
  label: string;
  className?: any;
  onClick?: () => any;
}

export const ColumnDisplayWidget: React.FC<ColumnDisplayWidgetProps> = (props) => {
  let parts = (props.label || '').split(' ');
  if (parts.length >= 5) {
    return (
      <S.Width className={props.className} length={150} clickable={!!props.onClick} onClick={props.onClick}>
        {props.label}
      </S.Width>
    );
  }
  if (parts.length >= 3) {
    return (
      <S.Width className={props.className} length={80} clickable={!!props.onClick} onClick={props.onClick}>
        {props.label}
      </S.Width>
    );
  }
  return (
    <S.Span className={props.className} clickable={!!props.onClick} onClick={props.onClick}>
      {props.label}
    </S.Span>
  );
};

namespace S {
  const clickableStyle = `
    cursor: pointer;
    user-select: none;
    &:hover {
      opacity: 0.9;
    }
  `;

  export const Width = styled.div<{ length: number; clickable: boolean }>`
    min-width: ${(p) => p.length}px;
    ${(p) => (p.clickable ? clickableStyle : '')};
  `;

  export const Span = styled.div<{ clickable: boolean }>`
    white-space: nowrap;
    ${(p) => (p.clickable ? clickableStyle : '')};
  `;
}
