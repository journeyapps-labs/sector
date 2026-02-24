import * as React from 'react';
import { Variable } from '@journeyapps/db';
import {
  DualIconWidget,
  IconWidget,
  MetadataWidget,
  ioc,
  setupTooltipProps,
  styled,
  TooltipPosition
} from '@journeyapps-labs/reactor-mod';
import { TypeEngine } from '../../../forms/TypeEngine';
import { SimpleFilter } from '../filters';

export interface SmartFilterWidgetProps {
  variable: Variable;
  filter?: SimpleFilter;
  filterChanged: (filter: SimpleFilter | null) => any;
}

export interface SmartFilterMetadataWidgetProps {
  variable: Variable;
  filter?: SimpleFilter;
  className?: any;
}

const getFilterSummary = (filter?: SimpleFilter): string => {
  const metadata = filter?.getMetadata() || [];
  if (metadata.length === 0) {
    return 'No filter applied';
  }
  return `Filtered by: ${metadata.map((entry) => `${entry.label} ${entry.value}`).join(', ')}`.trim();
};

const getFilterTooltip = (filter?: SimpleFilter): string => {
  if (!filter || !filter.statements || filter.statements.length === 0) {
    return 'Click to add a filter';
  }
  return `${getFilterSummary(filter)}. Click to edit filter`;
};

export const SmartFilterMetadataWidget: React.FC<SmartFilterMetadataWidgetProps> = (props) => {
  const metadata = props.filter?.getMetadata() || [];
  if (metadata.length === 0) {
    return null;
  }
  return (
    <S.MetaList className={props.className}>
      {metadata.map((entry, index) => {
        return (
          <MetadataWidget key={`${entry.label}-${entry.value}-${index}`} {...entry} active={entry.active ?? true} />
        );
      })}
    </S.MetaList>
  );
};

export const SmartFilterWidget: React.FC<SmartFilterWidgetProps> = (props) => {
  const isActive = (props.filter?.statements?.length || 0) > 0;
  const handler = ioc.get(TypeEngine).getHandler(props.variable.type);
  if (!handler?.setupFilter) {
    return null;
  }
  return (
    <S.FilterButton
      active={isActive}
      {...setupTooltipProps({
        tooltip: getFilterTooltip(props.filter),
        tooltipPos: TooltipPosition.BOTTOM
      })}
      onClick={async (event) => {
        const filter = await handler.setupFilter?.({
          variable: props.variable,
          filter: props.filter,
          position: event.nativeEvent
        });
        if (filter == null) {
          return;
        }
        props.filterChanged(filter);
      }}
    >
      {isActive ? <DualIconWidget icon1="filter" icon2="check" /> : <IconWidget icon="filter" />}
    </S.FilterButton>
  );
};

namespace S {
  export const MetaList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  `;

  export const FilterButton = styled.button<{ active: boolean }>`
    position: relative;
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 6px;
    border: 1px solid ${(p) => (p.active ? p.theme.guide.accent : p.theme.button.border)};
    background: ${(p) => (p.active ? p.theme.buttonPrimary.background : p.theme.button.background)};
    color: ${(p) => (p.active ? p.theme.buttonPrimary.color : p.theme.button.color)};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    line-height: 1;

    &:hover {
      color: ${(p) => (p.active ? p.theme.buttonPrimary.colorHover : p.theme.button.colorHover)};
    }
  `;
}
