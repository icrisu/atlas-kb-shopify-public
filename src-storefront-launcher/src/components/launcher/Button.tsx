import React, { Component } from 'react';
import {Motion, spring} from 'react-motion';
import noop from 'lodash';
//@ts-ignore
import cx from 'classnames';

// import Badge from './Badge';
import LaunchIcon from './LaunchIcon';
import CloseIcon from './CloseIcon';

const presets = {
  default: { stiffness: 330, damping: 20 },
};


class Button extends Component<any, any> {
    constructor(props: any) {
        super(props);
        
        this.state = {
          stable: false,
        }
        
        this._handleRest = this._handleRest.bind(this);
      }

      componentWillUnmount() {
        this.setState({
          stable: false,
        });
      }
      
      _handleRest() {
        this.setState({
          stable: true,
        });
      }

      render() {
        const { active, className, count, onClick } = this.props;
        
        const { stable } = this.state;
        
        let classes = cx({
          'atlas-launcher-button': true,
          'atlas-launcher-button--active': active,
        }, className);
    
        return (
          <Motion
            defaultStyle={{
              opacity: 0,
              scale: 0,
            }}
            style={{
              opacity: spring(1, presets.default),
              scale: spring(1, presets.default),
            }}
            onRest={this._handleRest}
          >
            {(interpolatingStyles: any) =>
              <button 
                className={classes}
                onClick={onClick || noop}
                style={{
                  opacity: interpolatingStyles.opacity,
                  transform: `scale(${interpolatingStyles.scale})`
                }}
              >
                <LaunchIcon active={active} />
                <CloseIcon active={active} />
              </button>
            }
          </Motion>
        );
      }
}

export default Button;
