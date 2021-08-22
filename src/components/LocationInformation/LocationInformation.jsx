import React, { useState, useEffect } from 'react';

import RiskScale from '../RiskScale';
import RiskLevel from '../RiskLevel';

import './LocationInformation.css';

export default React.memo(React.forwardRef(({ summary, activeCounty, width, isTouchDevice }, ref) => {
  return activeCounty ? (
    <div key={`county-info-${activeCounty.fips}`} className="location-information overlay" ref={ref} style={{ minWidth: `${.3 * width}px`}} data-tour="location-information">
      <RiskScale summary={summary} isTouchDevice={isTouchDevice} />
      <div className="state">
        <div className="abbreviation extra-bold-text">{activeCounty.state.code}</div>
        <div className="full-name bold-text">{activeCounty.state.name}</div>
      </div>
      <div className="region">
        <div className="cbsa bold-text" data-tour="cbsa-info">{(activeCounty.cbsa && activeCounty.cbsa.name) || activeCounty.name}</div>
        {activeCounty.cbsa && <div className="county light-text" data-tour="county-info">{activeCounty.name}</div>}
      </div>
    </div>) : null;
}))
