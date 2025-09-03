import * as React from 'react';
import { SingleChoiceIntegerType, SingleChoiceType, TextType, Variable } from '@journeyapps/db';
import { ComboBoxStore, DialogStore, ioc, PanelButtonWidget } from '@journeyapps-labs/reactor-mod';
import * as _ from 'lodash';
import { Condition, SimpleFilter } from '../filters';

export interface SmartFilterWidgetProps {
  variable: Variable;
  filter?: SimpleFilter;
  filterChanged: (filter: SimpleFilter | null) => any;
}

export const SmartFilterWidget: React.FC<SmartFilterWidgetProps> = (props) => {
  if (props.variable.type instanceof SingleChoiceIntegerType || props.variable.type instanceof SingleChoiceType) {
    return (
      <PanelButtonWidget
        {...{
          icon: 'filter',
          highlight: !!props.filter,
          action: async (position) => {
            let results = await ioc.get(ComboBoxStore).showMultiSelectComboBox(
              _.map(props.variable.type.options, (option) => {
                return {
                  title: `${option.value}`,
                  key: `${option.value}`,
                  checked: !!props.filter?.statements?.find((s) => s.arg === `${option.value}`)
                };
              }),
              position
            );
            if (results.length > 0) {
              props.filterChanged(
                new SimpleFilter(
                  props.variable,
                  results.map((r) => {
                    return {
                      arg: r.key,
                      condition: Condition.EQUALS
                    };
                  })
                )
              );
            } else {
              props.filterChanged(null);
            }
          }
        }}
      />
    );
  }
  if (props.variable.type instanceof TextType) {
    return (
      <PanelButtonWidget
        {...{
          icon: 'filter',
          highlight: !!props.filter,
          action: async () => {
            let value = await ioc.get(DialogStore).showInputDialog({
              title: `${props.variable.label}`,
              initialValue: props.filter?.statements[0]?.arg
            });
            if (value) {
              props.filterChanged(
                new SimpleFilter(props.variable, [
                  {
                    arg: value,
                    condition: Condition.EQUALS
                  }
                ])
              );
            } else {
              props.filterChanged(null);
            }
          }
        }}
      />
    );
  }
  return null;
};
