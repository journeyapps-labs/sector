import * as React from 'react';
import { TableColumn } from '@journeyapps-labs/reactor-mod';
import * as _ from 'lodash';
import { PageRow } from '../Page';
import { CellDisplayWidget } from '../widgets/CellDisplayWidget';
import { SmartColumnWidget } from '../widgets/SmartColumnWidget';
import { SmartCellDisplayWidget } from '../widgets/SmartCellDisplayWidget';
import { SmartBelongsToDisplayWidget } from '../widgets/SmartBelongsToDisplayWidget';
import { ColumnDisplayWidget } from '../widgets/ColumnDisplayWidget';
import { SchemaModelDefinition } from '../../SchemaModelDefinition';
import { AbstractConnection } from '../../AbstractConnection';
import { SimpleQuerySort, SortDirection } from './SimpleQueryTypes';
import { SimpleQuerySortState } from './SimpleQuerySortState';
import { SimpleQueryFilterState } from './SimpleQueryFilterState';
import { STANDARD_MODEL_FIELD_LABELS, StandardModelFields } from '../StandardModelFields';

export interface BuildSimpleQueryColumnsOptions {
  definition: SchemaModelDefinition;
  connection: AbstractConnection;
  sortState: SimpleQuerySortState;
  filterState: SimpleQueryFilterState;
}

export const buildSimpleQueryColumns = (options: BuildSimpleQueryColumnsOptions): TableColumn[] => {
  const getSortLabel = (field: string, label: string) => {
    const direction = options.sortState.getSort(field)?.direction;
    if (!direction) {
      return label;
    }
    return `${label} ${direction === SortDirection.ASC ? '↑' : '↓'}`;
  };

  return [
    {
      key: StandardModelFields.ID,
      display: (
        <ColumnDisplayWidget
          label={getSortLabel(StandardModelFields.ID, STANDARD_MODEL_FIELD_LABELS[StandardModelFields.ID])}
          onClick={async () => {
            const sort = options.sortState.getSort(StandardModelFields.ID);
            if (!sort) {
              options.sortState.addSort(SimpleQuerySort.create(StandardModelFields.ID));
              return;
            }
            sort.toggle();
          }}
        />
      ),
      noWrap: true,
      shrink: true
    },
    {
      key: StandardModelFields.UPDATED_AT,
      display: (
        <ColumnDisplayWidget
          label={getSortLabel(
            StandardModelFields.UPDATED_AT,
            STANDARD_MODEL_FIELD_LABELS[StandardModelFields.UPDATED_AT]
          )}
          onClick={async () => {
            const sort = options.sortState.getSort(StandardModelFields.UPDATED_AT);
            if (!sort) {
              options.sortState.addSort(SimpleQuerySort.create(StandardModelFields.UPDATED_AT));
              return;
            }
            sort.toggle();
          }}
        />
      ),
      noWrap: true,
      shrink: true,
      accessor: (cell, row: PageRow) => {
        return <CellDisplayWidget name={StandardModelFields.UPDATED_AT} cell={row.model.updated_at} row={row} />;
      }
    },
    ..._.map(options.definition.definition.belongsToIdVars, (a) => {
      return {
        key: a.name,
        display: (
          <SmartColumnWidget
            variable={options.definition.definition.belongsToVars[a.relationship]}
            type={options.definition.definition.belongsTo[a.relationship].foreignType}
            filterChanged={(filter) => {}}
          />
        ),
        noWrap: true,
        shrink: true,
        accessor: (cell, row: PageRow) => {
          return <SmartBelongsToDisplayWidget variable_id={a} row={row} connection={options.connection} />;
        }
      } as TableColumn;
    }),
    ..._.map(options.definition.definition.attributes, (a) => {
      return {
        key: a.name,
        display: (
          <SmartColumnWidget
            variable={a}
            filter={options.filterState.getFilter(a.name)}
            sortDirection={options.sortState.getSort(a.name)?.direction}
            onToggleSort={async () => {
              const sort = options.sortState.getSort(a.name);
              if (!sort) {
                options.sortState.addSort(SimpleQuerySort.create(a.name));
                return;
              }
              sort.toggle();
            }}
            filterChanged={async (filter) => {
              if (!filter) {
                options.filterState.removeFilter(a.name);
                return;
              }
              options.filterState.setFilter(a.name, filter);
            }}
          />
        ),
        noWrap: true,
        shrink: true,
        accessor: (cell, row: PageRow) => {
          return <SmartCellDisplayWidget name={a.name} row={row} />;
        }
      } as TableColumn;
    })
  ];
};
