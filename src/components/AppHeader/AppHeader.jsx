import React from 'react';

import MapControls from '../MapControls';
import LocationInformation from '../LocationInformation';

import './AppHeader.css';

import logo from './covid-act-now-logo.png';

export default React.forwardRef(({ ...rest }, ref) => {
  const style = {};

  if (rest.width - 30 - 280 > 0 ) {
    style.width = `${rest.width - 30}px`;
  }

  return (
    <div className="app-header" style={style}>
      <div className="left-app-header">
        <MapControls {...rest} />
        <div className="powered-by">
          <div className="powered-by-text bold-text">powered by</div>
          <div className="logo-container">
            <img className="logo" src={logo} onClick={(e) => window.open('https://covidactnow.org', '_newtab')} />
          </div>
        </div>
      </div>
      <LocationInformation {...rest} ref={ref} />
    </div>
  )
})
