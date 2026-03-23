import * as React from 'react';
import { NotificationStore, NotificationType, TableButtonWidget, ioc, styled } from '@journeyapps-labs/reactor-mod';
import { copyTextToClipboard } from '@journeyapps-labs/lib-reactor-utils';

export interface IDCellDisplayWidgetProps {
  id: string;
}

export const IDCellDisplayWidget: React.FC<IDCellDisplayWidgetProps> = (props) => {
  const notifications = ioc.get(NotificationStore);

  return (
    <S.Container>
      <S.Value>{props.id}</S.Value>
      <TableButtonWidget
        icon="copy"
        tooltip="Copy ID"
        action={() => {
          copyTextToClipboard(props.id);
          notifications.showNotification({
            title: 'Copied',
            description: 'ID copied to clipboard',
            type: NotificationType.SUCCESS
          });
        }}
      />
    </S.Container>
  );
};

namespace S {
  export const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    column-gap: 5px;
    width: 100%;
  `;

  export const Value = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `;
}
