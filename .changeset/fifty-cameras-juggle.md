---
'@journeyapps-labs/reactor-mod-data-browser': minor
---

Ship a major Query Controls upgrade focused on speed, clarity, and persistence.

Highlights:
- Add a full Sort Controls experience:
  - Multi-column sorting with ASC/DESC directions.
  - Clickable table headers to cycle sort states.
  - Drag-and-drop reordering of sort priority (DnD3).
  - Sort state persisted in saved queries.
- Add a Filter Controls group in table controls:
  - `+` picker to add/edit filters by field.
  - Metadata-based filter chips (reusing filter-provided metadata).
  - Explicit filter removal via chip actions.
- Expand filter capabilities:
  - Statement-based filters support multiple conditions and global AND/OR matching.
  - Text filters now support `=`, `starts with`, and `contains`.
  - Number and date filters support comparison operators via form-driven setup.
- Improve loading UX for query updates:
  - Keep the current page rendered while new data loads.
  - Hot-swap page data only when the next page is ready.
  - Show a lightweight loading spinner in query controls instead of jarring content loaders.
- Add new user preferences under `Query Controls`:
  - Show sort controls.
  - Show filter controls.

Also includes internal refactors for cleaner handler-owned filter setup, filter serialization typing, and modularized table-control widgets.
