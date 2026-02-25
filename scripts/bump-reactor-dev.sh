#!/bin/bash
set -euo pipefail

pnpm update -r \
  @journeyapps-labs/reactor-mod@dev \
  @journeyapps-labs/reactor-mod-editor@dev \
  @journeyapps-labs/lib-reactor-builder@dev \
  @journeyapps-labs/lib-reactor-data-layer@dev \
  @journeyapps-labs/lib-reactor-search@dev \
  @journeyapps-labs/lib-reactor-utils@dev \
  @journeyapps-labs/lib-reactor-server@dev

pnpm install
