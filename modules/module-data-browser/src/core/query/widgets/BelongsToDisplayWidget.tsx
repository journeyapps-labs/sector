import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Variable } from '@journeyapps/db';
import { SchemaModelObject } from '../../SchemaModelObject';
import { AbstractConnection } from '../../AbstractConnection';

export interface BelongsToDisplayWidgetProps {
  variable: Variable;
  id: string;
  connection: AbstractConnection;
}

export const BelongsToDisplayWidget: React.FC<BelongsToDisplayWidgetProps> = (props) => {
  const [object, setObject] = useState<SchemaModelObject>(null);
  const [display, setDisplay] = useState<string>();

  useEffect(() => {
    if (!props.id) {
      return;
    }

    props.connection.waitForSchemaModelDefinitionByName(props.variable.relationship).then((conn) =>
      conn
        .resolve(props.id)
        .then((obj) => {
          setObject(obj);
          return obj.displayValue();
        })
        .then((value) => {
          setDisplay(value);
        })
    );
  }, [props.id]);

  if (!props.id) {
    return <S.Empty>Not set</S.Empty>;
  }

  return display;
};
namespace S {
  export const Empty = styled.div`
    opacity: 0.2;
  `;

  export const Container = styled.div``;
}
