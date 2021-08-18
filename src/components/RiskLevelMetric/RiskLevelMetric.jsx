import React from 'react';

import RiskLevel from '../RiskLevel';

import './RiskLevelMetric.css';

function RiskLevelUnit({ summary, riskLevel, level }) {
  return (
    <div className={`risk-level ${riskLevel} ${RiskLevel.valueOf(level) === riskLevel ? 'active' : ''}`} />
  )
}

export default function RiskLevelMetric({ label, riskLevel }) {
  return (
    <div className="risk-level-metric">
      <div className="risk-level-label bold-text">{`${label}`}</div>
      <div className="risk-level-scale">
        {RiskLevel.values().map(r => <RiskLevelUnit key={riskLevel} riskLevel={r} level={riskLevel} />)}
      </div>
    </div>
  )
}
