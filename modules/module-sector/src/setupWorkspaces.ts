import { EmptyReactorPanelModel, ioc, System, WorkspaceStore } from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '@journeyapps-labs/reactor-mod-data-browser';

export const setupWorkspaces = () => {
  const workspaceStore = ioc.get(WorkspaceStore);
  const system = ioc.get(System);

  const generateSimpleWorkspace = () => {
    let model = workspaceStore.generateRootModel();

    model.addModel(
      system
        .getDefinition(DataBrowserEntities.CONNECTION)
        .getPanelComponents()[0]
        .generatePanelFactory()
        .generateModel()
    );

    model.addModel(workspaceStore.engine.generateReactorTabModel().addModel(new EmptyReactorPanelModel()));
    return model;
  };

  workspaceStore.registerWorkspaceGenerator({
    generateAdvancedWorkspace: async () => {
      return {
        name: 'Browse data',
        priority: 1,
        model: generateSimpleWorkspace()
      };
    },
    generateSimpleWorkspace: async () => {
      return {
        name: 'Browse data',
        priority: 1,
        model: generateSimpleWorkspace()
      };
    }
  });
};
