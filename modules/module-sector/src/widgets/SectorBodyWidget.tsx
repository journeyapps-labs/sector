import * as React from 'react';
import { BodyWidget } from '@journeyapps-labs/reactor-mod';

const logo = require('../../media/logo-long.png');

export const SectorBodyWidget: React.FC = (props) => {
  return <BodyWidget additionalFooterRightBtns={[]} logo={logo} additionalLayers={[]} logoClicked={() => {}} />;
};
