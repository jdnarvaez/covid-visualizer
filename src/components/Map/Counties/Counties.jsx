import React, { memo, forwardRef } from 'react';

export const Counties = memo(forwardRef(({ mapLayer, counties }, ref) => {
  const fillColor = (county, mapLayer) => {
    let fill;

    switch (mapLayer) {
      case 'cfr':
        fill = county.fill && county.fill.cfr;
        break;
      case 'cdc':
        fill = county.fill && county.fill.cdc;
        break;
      case 'risk':
        fill = county.fill && county.fill.riskLevels.overall;
        break;
      case 'deaths':
        fill = county.fill && county.fill.deaths;
        break;
      case 'vaccinated':
        fill = county.fill && county.fill.vaccinated;
        break;
      case 'cases':
        fill = county.fill && county.fill.cases;
        break;
      case 'caseDensity':
        fill = county.fill && county.fill.caseDensity;
        break;
      case 'infectionRate':
        fill = county.fill && county.fill.infectionRate;
        break;
      case 'testPositivityRatio':
        fill = county.fill && county.fill.testPositivityRatio;
        break;
    }

    return fill ? fill : 'rgba(255, 255, 255, 0)';
  }

   return counties ? <g key="county-shapes">{counties.map(county =>
     <path
       id={county.fips}
       state-fips={county.state.fips}
       className={`county-shape`}
       key={`${county.fips}`}
       fill={fillColor(county, mapLayer)}
       fillOpacity=".8"
       strokeWidth=".25"
       pointerEvents="none"
       zIndex="1"
       d={county.path}
     />)}</g> : null;
}))
