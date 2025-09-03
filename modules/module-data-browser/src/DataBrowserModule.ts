import { AbstractReactorModule, System, WorkspaceStore } from '@journeyapps-labs/reactor-mod';
import { Container } from '@journeyapps-labs/common-ioc';
import { ConnectionStore } from './stores/ConnectionStore';
import { ConnectionEntityDefinition } from './entities/ConnectionEntityDefinition';
import { ManualConnectionFactory } from './core/types/ManualConnectionFactory';
import { ConnectionFactoryEntityDefinition } from './entities/ConnectionFactoryEntityDefinition';
import { AddConnectionAction } from './actions/connections/AddConnectionAction';
import { RemoveConnectionAction } from './actions/connections/RemoveConnectionAction';
import { SchemaModelDefinitionEntityDefinition } from './entities/SchemaModelDefinitionEntityDefinition';
import { QueryPanelFactory } from './panels/query/QueryPanelFactory';
import { QuerySchemaModelAction } from './actions/schema-definitions/QuerySchemaModelAction';
import { QueryEntityDefinition } from './entities/QueryEntityDefinition';
import { ModelPanelFactory } from './panels/model/ModelPanelFactory';
import { CreateModelAction } from './actions/schema-definitions/CreateModelAction';
import { SchemaModelObjectEntityDefinition } from './entities/SchemaModelObjectEntityDefinition';
import { EditSchemaModelAction } from './actions/schema-model/EditSchemaModelAction';

export class DataBrowserModule extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Data Browser'
    });
  }

  register(ioc: Container) {
    const system = ioc.get(System);
    const workspaceStore = ioc.get(WorkspaceStore);

    let connectionStore = new ConnectionStore();

    connectionStore.registerConnectionFactory(new ManualConnectionFactory());

    system.registerAction(new AddConnectionAction());
    system.registerAction(new RemoveConnectionAction());
    system.registerAction(new QuerySchemaModelAction());
    system.registerAction(new CreateModelAction());
    system.registerAction(new EditSchemaModelAction());

    system.addStore(ConnectionStore, connectionStore);

    system.registerDefinition(new ConnectionEntityDefinition());
    system.registerDefinition(new ConnectionFactoryEntityDefinition());
    system.registerDefinition(new SchemaModelDefinitionEntityDefinition());
    system.registerDefinition(new SchemaModelObjectEntityDefinition());
    system.registerDefinition(new QueryEntityDefinition());

    workspaceStore.registerFactory(new QueryPanelFactory());
    workspaceStore.registerFactory(new ModelPanelFactory());
  }

  async init(ioc: Container): Promise<any> {
    ioc.get(ConnectionStore).init();
  }
}
