import React from 'react';

import MapControls from '../MapControls';
import LocationInformation from '../LocationInformation';

import './AppHeader.css';

export default React.forwardRef(({ ...rest }, ref) => {
  const style = {};

  if (rest.width - 30 - 280 > 0 ) {
    style.width = `${rest.width - 30}px`;
  }

  return (
    <div className="app-header" style={style}>
      <div className="left-app-header">
        <MapControls {...rest} />
      </div>
      <LocationInformation {...rest} ref={ref} />
    </div>
  )
})
