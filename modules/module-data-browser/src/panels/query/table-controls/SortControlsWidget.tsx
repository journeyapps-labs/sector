import * as React from 'react';
import {
  ComboBoxItem,
  ComboBoxStore2,
  InputContainerWidget,
  ioc,
  PanelButtonWidget,
  SimpleComboBoxDirective,
  styled
} from '@journeyapps-labs/reactor-mod';
import { SimpleQuery } from '../../../core/query/query-simple/SimpleQuery';
import { SortChipWidget } from './SortChipWidget';

export interface SortControlsWidgetProps {
  simpleQuery: SimpleQuery;
  goToPage?: (index: number) => any;
}

export const SortControlsWidget: React.FC<SortControlsWidgetProps> = (props) => {
  const showAddSortMenu = async (event: React.MouseEvent<any>) => {
    const used = new Set(props.simpleQuery.sorts.map((sort) => sort.field));
    const fields = props.simpleQuery.getSortableFields().filter((field) => !used.has(field.key));
    if (fields.length === 0) {
      return;
    }
    const directive = await ioc.get(ComboBoxStore2).show(
      new SimpleComboBoxDirective({
        title: 'Add sort',
        event: event as any,
        items: fields.map((field) => {
          return {
            key: field.key,
            title: field.label,
            action: async () => {
              await props.simpleQuery.addSort(field.key);
              props.goToPage?.(0);
            }
          } as ComboBoxItem;
        })
      })
    );
    directive.getSelectedItem();
  };

  const getSortLabel = (field: string) => {
    const resolved = props.simpleQuery.getSortableFields().find((entry) => entry.key === field);
    return resolved?.label || field;
  };

  return (
    <InputContainerWidget label="Sort">
      <S.Group>
        <PanelButtonWidget
          icon="plus"
          tooltip="Add sort"
          action={async (event) => {
            await showAddSortMenu(event as any);
          }}
        />
        {props.simpleQuery.sorts.map((sort) => {
          return (
            <SortChipWidget
              key={sort.field}
              sort={sort}
              label={getSortLabel(sort.field)}
              onToggle={async () => {
                await props.simpleQuery.toggleSort(sort.field);
                props.goToPage?.(0);
              }}
              onRemove={async () => {
                await props.simpleQuery.removeSort(sort.field);
                props.goToPage?.(0);
              }}
              onDropBefore={async (sourceField) => {
                await props.simpleQuery.reorderSort(sourceField, sort.field);
                props.goToPage?.(0);
              }}
            />
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
}
