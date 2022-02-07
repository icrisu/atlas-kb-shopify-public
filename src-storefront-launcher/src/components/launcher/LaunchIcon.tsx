import React from 'react';
import {Motion, spring} from 'react-motion';
import { get } from 'lodash';

const presets = {
  default: { stiffness: 330, damping: 20 },
};


const LaunchIcon = ({ active }: any) => (
    <Motion 
      defaultStyle={{
        opacity: 1,
        rotate: 0,
        scale: 1,
      }}
      style={{
        opacity: spring(active ? 0 : 1, presets.default),
        rotate: spring(active ? 45 : 0, presets.default),
        scale: spring(active ? 0 : 1, presets.default),
      }}
    >
      {interpolatingStyles =>
        <img
          alt="Launcher Icon"
          className="atlas-launcher-icon atlas-launcher-icon--launcher"
          src={`${get(window, 'atlasHlpcSetting.launcherIcon', '')}`}
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
export default LaunchIcon;
