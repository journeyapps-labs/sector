import * as React from 'react';
import { useEffect, useState } from 'react';
import { SchemaModelObject } from '../../SchemaModelObject';
import { AbstractConnection } from '../../AbstractConnection';
import { IconWidget, styled, TableButtonWidget } from '@journeyapps-labs/reactor-mod';
import { copyTextToClipboard } from '@journeyapps-labs/lib-reactor-utils';
import { Relationship } from '@journeyapps/parser-schema';

export interface BelongsToDisplayWidgetProps {
  relationship: Relationship;
  id: string;
  connection: AbstractConnection;
  open: (object: SchemaModelObject) => any;
}

export const BelongsToDisplayWidget: React.FC<BelongsToDisplayWidgetProps> = (props) => {
  const [object, setObject] = useState<SchemaModelObject>(null);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (!props.id) {
      return;
    }

    props.connection.waitForSchemaModelDefinitionByName(props.relationship.foreignType.name).then((conn) =>
      conn.resolve(props.id).then((obj) => {
        if (!obj) {
          setBroken(true);
          return;
        }
        setObject(obj);
      })
    );
  }, [props.id]);

  if (broken) {
    return (
      <S.Warning
        tooltip="Copy ID"
        label={`${props.id} not found`}
        icon="warning"
        action={() => {
          copyTextToClipboard(props.id);
        }}
      />
    );
  }

  if (!props.id) {
    return <S.Empty>Not set</S.Empty>;
  }

  if (!object) {
    return <S.Spinner spin={true} icon="spinner" />;
  }

  return (
    <S.Container>
      <BelongsToStringWidget model={object} />
      <TableButtonWidget
        icon="arrow-right"
        action={() => {
          props.open(object);
        }}
      />
    </S.Container>
  );
};

export const BelongsToStringWidget: React.FC<{ model: SchemaModelObject }> = ({ model }) => {
  const [display, setDisplay] = useState<string>();
  useEffect(() => {
    model.displayValue().then((value) => {
      setDisplay(value);
    });
  }, []);

  if (!display) {
    return <S.Spinner spin={true} icon="spinner" />;
  }

  return <span>{display}</span>;
};

namespace S {
  export const Warning = styled(TableButtonWidget)`
    display: flex;
    flex-direction: row;
  `;

  export const Empty = styled.div`
    opacity: 0.2;
  `;

  export const Spinner = styled(IconWidget)`
    opacity: 0.2;
  `;

  export const Container = styled.div`
    display: flex;
    flex-direction: row;
    column-gap: 5px;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
  `;
}
