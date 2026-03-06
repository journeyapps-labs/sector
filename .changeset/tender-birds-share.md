---
'@journeyapps-labs/reactor-mod-data-browser': minor
---

Improve query panel state behavior for data browser queries.

- Default new simple queries to sort by `updated_at` descending.
- Keep in-memory query page and table scroll offsets when switching tabs.
- Fix browser-reload query panels getting stuck by reactively triggering initial query load after hydration.
