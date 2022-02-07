import React from 'react';
import { get } from 'lodash';

const Preloader = () => {
    
    const preloader: string = get(window, 'atlasHlpcSetting.preloader', '');
    return (
        <div className="atlas-preloader">
            <img src={`${preloader}`} alt="" />
        </div>
    );
  };
export default Preloader;
