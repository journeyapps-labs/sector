import { AbstractReactorModule, ActionStore, PrefsStore, System, WorkspaceStore } from '@journeyapps-labs/reactor-mod';
import { Container } from '@journeyapps-labs/common-ioc';
import { ConnectionStore } from './stores/ConnectionStore';
import { ConnectionEntityDefinition } from './entities/ConnectionEntityDefinition';
import { ManualConnectionFactory } from './core/types/ManualConnectionFactory';
import { ConnectionFactoryEntityDefinition } from './entities/ConnectionFactoryEntityDefinition';
import { AddConnectionAction } from './actions/connections/AddConnectionAction';
import { RemoveConnectionAction } from './actions/connections/RemoveConnectionAction';
import { SetConnectionColorAction } from './actions/connections/SetConnectionColorAction';
import { SchemaModelDefinitionEntityDefinition } from './entities/SchemaModelDefinitionEntityDefinition';
import { QueryPanelFactory } from './panels/query/QueryPanelFactory';
import { QuerySchemaModelAction } from './actions/schema-definitions/QuerySchemaModelAction';
import { QueryEntityDefinition } from './entities/QueryEntityDefinition';
import { ModelPanelFactory } from './panels/model/ModelPanelFactory';
import { CreateModelAction } from './actions/schema-definitions/CreateModelAction';
import { SchemaModelObjectEntityDefinition } from './entities/SchemaModelObjectEntityDefinition';
import { EditSchemaModelAction } from './actions/schema-model/EditSchemaModelAction';
import { TypeEngine } from './forms/TypeEngine';
import { ViewSchemaModelAsJsonAction } from './actions/schema-model/ViewSchemaModelAsJsonAction';
import { ModelJsonPanelFactory } from './panels/model-json/ModelJsonPanelFactory';
import { SchemaModelIndexDefinition } from './entities/SchemaModelIndexDefinition';
import { SavedQueryStore } from './stores/SavedQueryStore';
import { SavedQueryEntityDefinition } from './entities/SavedQueryEntityDefinition';
import { OpenSavedQueryAction } from './actions/saved-queries/OpenSavedQueryAction';
import { RemoveSavedQueryAction } from './actions/saved-queries/RemoveSavedQueryAction';
import { registerQueryControlPreferences } from './preferences/QueryControlPreferences';

export class DataBrowserModule extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Data Browser'
    });
  }

  register(ioc: Container) {
    const system = ioc.get(System);
    const actionStore = ioc.get(ActionStore);
    const workspaceStore = ioc.get(WorkspaceStore);

    let connectionStore = new ConnectionStore();
    ioc.bind(TypeEngine).toConstantValue(new TypeEngine());

    connectionStore.registerConnectionFactory(new ManualConnectionFactory());

    actionStore.registerAction(new AddConnectionAction());
    actionStore.registerAction(new RemoveConnectionAction());
    actionStore.registerAction(new SetConnectionColorAction());
    actionStore.registerAction(new QuerySchemaModelAction());
    actionStore.registerAction(new CreateModelAction());
    actionStore.registerAction(new EditSchemaModelAction());
    actionStore.registerAction(new ViewSchemaModelAsJsonAction());
    actionStore.registerAction(new OpenSavedQueryAction());
    actionStore.registerAction(new RemoveSavedQueryAction());

    system.addStore(ConnectionStore, connectionStore);
    system.addStore(SavedQueryStore, new SavedQueryStore());
    registerQueryControlPreferences(ioc.get(PrefsStore));

    system.registerDefinition(new ConnectionEntityDefinition());
    system.registerDefinition(new ConnectionFactoryEntityDefinition());
    system.registerDefinition(new SchemaModelDefinitionEntityDefinition());
    system.registerDefinition(new SchemaModelObjectEntityDefinition());
    system.registerDefinition(new SchemaModelIndexDefinition());
    system.registerDefinition(new QueryEntityDefinition());
    system.registerDefinition(new SavedQueryEntityDefinition());

    workspaceStore.registerFactory(new QueryPanelFactory());
    workspaceStore.registerFactory(new ModelPanelFactory());
    workspaceStore.registerFactory(new ModelJsonPanelFactory());
  }

  async init(ioc: Container): Promise<any> {
    ioc.get(ConnectionStore).init();
    ioc.get(SavedQueryStore).init();
  }
}
