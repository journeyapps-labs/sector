import { BooleanSetting, PrefsStore } from '@journeyapps-labs/reactor-mod';

export enum QueryControlPreferences {
  SHOW_SORT_CONTROLS = 'databrowser/query-controls/show-sort-controls',
  SHOW_FILTER_CONTROLS = 'databrowser/query-controls/show-filter-controls'
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
};
