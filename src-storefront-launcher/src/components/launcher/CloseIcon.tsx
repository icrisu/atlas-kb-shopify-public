import React from 'react';
import {Motion, spring} from 'react-motion';
import { get } from 'lodash';
// @ts-ignore
const presets = {
  default: { stiffness: 330, damping: 20 },
};
// launcher-close-icon.png



const CloseIcon = ({ active }: any) => (
    <Motion 
      defaultStyle={{
        opacity: 0,
        rotate: -45,
        scale: 0,
      }}
      style={{
        opacity: spring(active ? 1 : 0, presets.default),
        rotate: spring(active ? 0 : -45, presets.default),
        scale: spring(active ? .7 : 0, presets.default),
      }}
    >
      {interpolatingStyles =>
        <img 
          alt="Close Icon"
          className="atlas-launcher-icon atlas-launcher--close" src={`${get(window, 'atlasHlpcSetting.launcherCloseIcon', '')}`}
          style={{
            opacity: interpolatingStyles.opacity,
            transform: `
              rotate(${interpolatingStyles.rotate}deg) 
              scale(${interpolatingStyles.scale})
              translate(-50%, -50%)
            `,
          }} 
        />
      }
    </Motion>
  );

  export default CloseIcon;
  