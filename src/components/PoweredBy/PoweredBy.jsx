import React from 'react';

import './PoweredBy.css';
import logo from './covid-act-now-logo.png';

export default function PoweredBy({ style }) {
  return (
    <div className="powered-by" style={style}>
      <div className="powered-by-text bold-text">powered by</div>
      <div className="logo-container">
        <img className="logo" src={logo} onClick={(e) => window.open('https://covidactnow.org', '_newtab')} />
      </div>
    </div>
  )
}
