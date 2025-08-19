import { EntityDefinition, inject, InlineEntityEncoderComponent } from '@journeyapps-labs/reactor-mod';
import { DataBrowserEntities } from '../entities';
import { ConnectionStore } from '../stores/ConnectionStore';
import { AbstractQuery, AbstractQueryEncoded } from '../core/query/AbstractQuery';
import { SimpleQuery } from '../core/query/SimpleQuery';

export class QueryEntityDefinition extends EntityDefinition<AbstractQuery> {
  @inject(ConnectionStore)
  accessor connectionStore: ConnectionStore;

  constructor() {
    super({
      type: DataBrowserEntities.QUERY,
      category: 'DataBrowser',
      label: 'Query',
      icon: 'search',
      iconColor: 'red'
    });

    this.registerComponent(
      new InlineEntityEncoderComponent<AbstractQuery, AbstractQueryEncoded>({
        version: 1,
        encode: (e) => {
          return e.serialize();
        },
        decode: async (entity) => {
          if (entity.type === 'simple') {
            let query = new SimpleQuery();
            await query.deserialize(this.connectionStore, entity as any);
            return query;
          }
        }
      })
    );
  }

  matchEntity(t: any): boolean {
    if (t instanceof AbstractQuery) {
      return true;
    }
  }

  getEntityUID(t: AbstractQuery) {
    return t.id;
  }
}
