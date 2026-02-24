import { BooleanSetting, PrefsStore } from '@journeyapps-labs/reactor-mod';

export enum QueryControlPreferences {
  SHOW_SORT_CONTROLS = 'databrowser/query-controls/show-sort-controls',
  SHOW_FILTER_CONTROLS = 'databrowser/query-controls/show-filter-controls',
  FILTER_NULL_FIELDS_IN_RELATIONSHIP_PEEK = 'databrowser/query-controls/filter-null-fields-in-relationship-peek'
}

export const registerQueryControlPreferences = (prefsStore: PrefsStore) => {
  prefsStore.registerPreference(
    new BooleanSetting({
      key: QueryControlPreferences.SHOW_SORT_CONTROLS,
      checked: true,
      name: 'Show sort controls',
      category: 'Query Controls'
    })
  );
  prefsStore.registerPreference(
    new BooleanSetting({
      key: QueryControlPreferences.SHOW_FILTER_CONTROLS,
      checked: true,
      name: 'Show filter controls',
      category: 'Query Controls'
    })
  );
  prefsStore.registerPreference(
    new BooleanSetting({
      key: QueryControlPreferences.FILTER_NULL_FIELDS_IN_RELATIONSHIP_PEEK,
      checked: true,
      name: 'Hide null fields in relationship peek',
      category: 'Query Controls'
    })
  );
};
