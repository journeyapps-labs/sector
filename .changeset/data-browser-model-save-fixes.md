---
'@journeyapps-labs/reactor-mod-data-browser': patch
---

Improve data browser query and model editing workflows.

- Fix empty query result sets showing a perpetual page-count spinner and keep the page selector disabled when no pages are available.
- Add a primary "Create model" action to simple query panels.
- Fix new model forms and restored new model panels so draft objects hydrate correctly.
- Fix clearing belongs-to relationships before saving.
- Improve model and bulk-save feedback with button loading states, visor loading, and success notifications.
- Adjust filter tooltip positioning to reduce table overflow.
