import React from 'react';
import ReactTooltip from 'react-tooltip';

import RiskLevel from '../RiskLevel';

import './RiskScale.css';

function RiskLevelUnit({ summary, riskLevel }) {
  return (
    <div className={`risk-level ${riskLevel} ${summary ? (RiskLevel.valueOf(summary.riskLevels.overall) === riskLevel ? 'active' : '') : ''}`} />
  )
}
export default function LocationInformation({ summary, activeCounty }) {
  return (
    <div className="risk-scale" data-tip data-for='risk-scale' data-tour="risk-scale">
      {RiskLevel.values().reverse().map(riskLevel => <RiskLevelUnit key={riskLevel} summary={summary} riskLevel={riskLevel} />)}
      <ReactTooltip
        id='risk-scale'
        aria-haspopup='true'
        effect="solid"
        delayShow={500}
        className="tooltip"
        clickable={true}
      >
        <div style={{ maxWidth: `${.3 * innerWidth}px`, fontSize: '13px' }}>
          <p>The COVID ActNow Risk Scale is used to highlight counties on the map.</p>
          <p>The COVID ActNow risk level looks at three things: daily new cases (per 100K), infection rate, and positive test rate. Each is graded on a five-color scale and the highest risk color becomes the location’s overall risk level. The one exception is that if a location's daily new cases is green, then its overall risk level is green.</p>
          <p>We developed our risk framework in partnership with the Harvard Global Health Institute and Harvard Edmond J. Safra Center for Ethics. As there is not a standardized framework for risk in the U.S., it may not match your state or county's risk level.</p>
        </div>
      </ReactTooltip>
    </div>
  )
}
