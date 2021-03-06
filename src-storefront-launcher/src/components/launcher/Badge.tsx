import React from 'react';
import {Motion, spring} from 'react-motion';
//@ts-ignore
import cx from 'classnames';
const presets = {
  default: { stiffness: 330, damping: 20 },
};


const Badge = ({ active, count, stable }: any) => {
    let classes = cx({
      'atlas-launcher-badge': true,
      'atlas-launcher--active': active,
    });
    
    return (
      <Motion
        defaultStyle={{
          opacity: 0,
          scale: 0,
        }}
        style={{
          opacity: spring(!active && stable ? 1 : 0, presets.default),
          scale: spring(!active && stable ? 1 : 0, presets.default),
        }}
      >
        {interpolatingStyles =>
          <div 
            className={classes}
            style={{
              opacity: interpolatingStyles.opacity,
              transform: `
                translate(-100%, 100%)
                scale(${interpolatingStyles.scale})
              `
            }}
          >
            {count || 0}
          </div>
        }
      </Motion>
    );
  };
export default Badge;
