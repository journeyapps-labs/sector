import { Query } from '@journeyapps/db';
import { AbstractFilter } from '../filters';
import { SimpleQuerySort, SortDirection } from './SimpleQueryTypes';

export const applyFiltersAndSorts = (query: Query, filters: AbstractFilter[], sorts: SimpleQuerySort[] = []): Query => {
  let next = query;
  (filters || []).forEach((filter) => {
    next = filter.augment(next);
  });
  if (sorts.length > 0) {
    next = next.orderBy(
      ...sorts.map((sort) => {
        return sort.direction === SortDirection.DESC ? `-${sort.field}` : sort.field;
      })
    );
  }
  return next;
};
