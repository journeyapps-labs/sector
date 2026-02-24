import * as React from 'react';
import styled from '@emotion/styled';

export interface ColumnDisplayWidgetProps {
  label: string;
  className?: any;
  onClick?: () => any;
}

export const ColumnDisplayWidget: React.FC<ColumnDisplayWidgetProps> = (props) => {
  const parts = (props.label || '').split(' ');
  const minWidth = parts.length >= 5 ? 150 : parts.length >= 3 ? 80 : undefined;
  return (
    <S.Label
      className={props.className}
      minWidth={minWidth}
      clickable={!!props.onClick}
      nowrap={!minWidth}
      onClick={props.onClick}
    >
      {props.label}
    </S.Label>
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

  export const Label = styled.div<{ minWidth?: number; clickable: boolean; nowrap: boolean }>`
    ${(p) => (p.minWidth ? `min-width: ${p.minWidth}px;` : '')};
    ${(p) => (p.nowrap ? 'white-space: nowrap;' : '')};
    ${(p) => (p.clickable ? clickableStyle : '')};
  `;
}
