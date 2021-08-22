import React, { memo } from 'react';
import { interpolateInferno, interpolateMagma, interpolateWarm, interpolateOrRd, interpolateGreens, interpolatePuRd, interpolateYlOrRd, interpolateRdYlGn } from 'd3-scale-chromatic';

import './Legend.css';

const stops = [0, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5, .55, .6, .65, .7, .75, .8, .85, .9, .95, 1];

const gradients = {
  risk: 'risk',
  cdc: 'cdc',
  cfr: 'interpolateWarm',
  deaths: 'interpolateOrRd',
  vaccinated: 'interpolateGreens',
  cases: 'interpolatePuRd',
  caseDensity: 'interpolateYlOrRd',
  testPositivityRatio: 'interpolateInferno',
  infectionRate: 'interpolateRdYlGn'
};

const interpolators = {
  cfr: interpolateWarm,
  deaths: interpolateOrRd,
  vaccinated: interpolateGreens,
  cases: interpolatePuRd,
  caseDensity: interpolateYlOrRd,
  testPositivityRatio: interpolateInferno,
  infectionRate: interpolateRdYlGn
};

const InterpolatedGradient = ({ id, interpolate, invert }) => {
  return (
    <linearGradient id={id} x1="0" x2="0" y1={invert ? 0 : 1} y2={invert ? 1 : 0}>
      {stops.map(stop => <stop offset={`${stop * 100}%`} stopColor={interpolate(stop)} />)}
    </linearGradient>
  )
}

export const Legend = memo(({ mapLayer }) => {
  return (
    <div className="map-legend" data-tour="map-legend">
      <svg viewBox="-3 -3 21 156">
        <defs>
          <linearGradient id="risk" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--low)" />
            <stop offset="20%" stopColor="var(--low)" />
            <stop offset="20%" stopColor="var(--medium)" />
            <stop offset="40%" stopColor="var(--medium)" />
            <stop offset="40%" stopColor="var(--high)" />
            <stop offset="60%" stopColor="var(--high)" />
            <stop offset="60%" stopColor="var(--very-high)" />
            <stop offset="80%" stopColor="var(--very-high)" />
            <stop offset="80%" stopColor="var(--severe)" />
            <stop offset="100%" stopColor="var(--severe)" />
          </linearGradient>
          <linearGradient id="cdc" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--low)" />
            <stop offset="20%" stopColor="var(--low)" />
            <stop offset="20%" stopColor="var(--medium)" />
            <stop offset="40%" stopColor="var(--medium)" />
            <stop offset="40%" stopColor="var(--high)" />
            <stop offset="60%" stopColor="var(--high)" />
            <stop offset="60%" stopColor="var(--very-high)" />
            <stop offset="80%" stopColor="var(--very-high)" />
            <stop offset="80%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          {Object.keys(interpolators).map(layer => <InterpolatedGradient key={layer} id={gradients[layer]} interpolate={interpolators[layer]} invert={layer === 'testPositivityRatio' || layer === 'infectionRate' || layer === 'cfr' }/>)}
        </defs>
        <rect x="0" y="0" rx="5" ry="5" width="15" height="150" strokeWidth="3" stroke="var(--white)" fill={`url(#${gradients[mapLayer]})`} />
      </svg>
    </div>
  )
})
