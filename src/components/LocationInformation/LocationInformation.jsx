import React, { useState, useEffect } from 'react';

import RiskScale from '../RiskScale';
import RiskLevel from '../RiskLevel';

import './LocationInformation.css';

export default React.forwardRef(({ summary, activeCounty, width }, ref) => {
  const [stateCodes, setStateCodes] = useState([]);

  useEffect(() => {
    import(
      /* webpackChunkName: "state-codes" */
      /* webpackMode: "lazy" */
      '../../data/state-codes.json'
    ).then(codes => setStateCodes(codes))
  }, [])

  return activeCounty ? (
    <div key={`county-info-${activeCounty.id}`} className="location-information overlay" ref={ref} style={{ minWidth: `${.3 * width}px`}} data-tour="location-information">
      <RiskScale summary={summary} />
      <div className="state">
        <div className="abbreviation extra-bold-text">{activeCounty.properties.state}</div>
        {stateCodes && <div className="full-name bold-text">{stateCodes[activeCounty.properties.state]}</div>}
      </div>
      <div className="region">
        {<div className="cbsa bold-text" data-tour="cbsa-info">{(activeCounty.properties.cbsa && activeCounty.properties.cbsa.NAMELSAD) || activeCounty.properties.name}</div>}
        {activeCounty.properties.name && <div className="county light-text" data-tour="county-info">{activeCounty.properties.name}</div>}
      </div>
    </div>) : null;
})
