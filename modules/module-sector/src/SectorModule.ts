import { AbstractReactorModule, UXStore, WorkspaceStore } from '@journeyapps-labs/reactor-mod';
import { Container } from '@journeyapps-labs/common-ioc';
import { SectorBodyWidget } from './widgets/SectorBodyWidget';
import { setupWorkspaces } from './setupWorkspaces';

const icon = require('../media/logo.png');

export class SectorModule extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Sector'
    });
  }
  register(ioc: Container) {
    const uxStore = ioc.get(UXStore);
    const workspaceStore = ioc.get(WorkspaceStore);
    uxStore.primaryLogo = icon;
    uxStore.primaryHeader = {
      label: 'Sector',
      action: () => {}
    };
    uxStore.secondaryHeader = {
      label: 'Databrowser',
      action: () => {}
    };

    uxStore.setFavicons(icon, icon);
    uxStore.setRootComponent(SectorBodyWidget);

    setupWorkspaces();
  }

  async init(ioc: Container): Promise<any> {}
}
