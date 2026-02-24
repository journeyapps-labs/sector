import * as React from 'react';
import {
  ComboBoxItem,
  ComboBoxStore2,
  InputContainerWidget,
  MetadataWidget,
  PanelButtonMode,
  PanelButtonWidget,
  SimpleComboBoxDirective,
  ioc,
  styled
} from '@journeyapps-labs/reactor-mod';
import { SimpleQuery } from '../../../core/query/query-simple/SimpleQuery';

export interface FilterControlsWidgetProps {
  simpleQuery: SimpleQuery;
  goToPage?: (index: number) => any;
}

export const FilterControlsWidget: React.FC<FilterControlsWidgetProps> = (props) => {
  const showAddFilterMenu = async (event: React.MouseEvent<any>) => {
    const fields = props.simpleQuery.filterState.getFilterableFields();
    if (fields.length === 0) {
      return;
    }
    const directive = await ioc.get(ComboBoxStore2).show(
      new SimpleComboBoxDirective({
        title: 'Add filter',
        event: event as any,
        items: fields.map((field) => {
          return {
            key: field.key,
            title: field.label,
            action: async () => {
              await props.simpleQuery.filterState.setupFilterForField(field.key, event.nativeEvent as any);
              props.goToPage?.(0);
            }
          } as ComboBoxItem;
        })
      })
    );
    directive.getSelectedItem();
  };

  const filters = props.simpleQuery.filterState.getActiveFilters();

  return (
    <InputContainerWidget label="Filters">
      <S.Group>
        <PanelButtonWidget
          icon="plus"
          tooltip="Add filter"
          action={async (event) => {
            await showAddFilterMenu(event as any);
          }}
        />
        {filters.map((entry) => {
          return (
            <S.FilterItem key={entry.key}>
              <S.FilterLabel>{entry.label}</S.FilterLabel>
              {entry.filter.getMetadata().map((meta, index) => {
                return <MetadataWidget key={`${entry.key}-${index}-${meta.label}-${meta.value}`} {...meta} />;
              })}
              <PanelButtonWidget
                mode={PanelButtonMode.LINK}
                icon="close"
                tooltip={`Clear ${entry.label} filter`}
                action={async () => {
                  props.simpleQuery.filterState.removeFilter(entry.key);
                  props.goToPage?.(0);
                }}
              />
            </S.FilterItem>
          );
        })}
      </S.Group>
    </InputContainerWidget>
  );
};

namespace S {
  export const Group = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 5px;
    row-gap: 5px;
    flex-wrap: wrap;
  `;

  export const FilterItem = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    column-gap: 4px;
  `;

  export const FilterLabel = styled.div`
    font-size: 12px;
    color: ${(p) => p.theme.text.secondary};
  `;
}
