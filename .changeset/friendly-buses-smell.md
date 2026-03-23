---
'@journeyapps-labs/reactor-mod-data-browser': minor
---

Expand Data Browser query tooling with better filtering, relationship workflows, and ID utilities.

- Show type labels under column headings.
- Add filtering support for boolean, belongs-to, and `ID` columns.
- Group Add Filter options into `Fields` and `Belongs to`.
- Make IDs easier to work with:
  - Add copy actions in ID cells.
  - Add copy support in relationship peek metadata.
  - Allow direct UUID paste in relationship search to resolve records by ID.
- Improve relationship workflows:
  - Add `View has many` from row context menus to open related records in a pre-filtered query.
  - Add `Filter belongs to` from relationship peek to apply a query filter from the selected related object.
- Make the `ID` column filterable but no longer sortable.
