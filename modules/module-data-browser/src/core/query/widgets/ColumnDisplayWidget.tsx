import * as React from 'react';
import styled from '@emotion/styled';

export interface ColumnDisplayWidgetProps {
  label: string;
  secondaryLabel?: string;
  className?: any;
  onClick?: () => any;
}

export const ColumnDisplayWidget: React.FC<ColumnDisplayWidgetProps> = (props) => {
  const parts = (props.label || '').split(' ');
  const minWidth = parts.length >= 5 ? 150 : parts.length >= 3 ? 80 : undefined;
  return (
    <S.Container
      className={props.className}
      minWidth={minWidth}
      clickable={!!props.onClick}
      nowrap={!minWidth}
      onClick={props.onClick}
    >
      <S.Label>{props.label}</S.Label>
      {props.secondaryLabel ? <S.SecondaryLabel>{props.secondaryLabel}</S.SecondaryLabel> : null}
    </S.Container>
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

  export const Container = styled.div<{ minWidth?: number; clickable: boolean; nowrap: boolean }>`
    ${(p) => (p.minWidth ? `min-width: ${p.minWidth}px;` : '')};
    ${(p) => (p.nowrap ? 'white-space: nowrap;' : '')};
    ${(p) => (p.clickable ? clickableStyle : '')};
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 2px;
  `;

  export const Label = styled.div``;

  export const SecondaryLabel = styled.div`
    opacity: 0.4;
    font-size: 12px;
  `;
}
