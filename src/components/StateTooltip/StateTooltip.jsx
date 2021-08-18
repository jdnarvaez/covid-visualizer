import React from 'react';

import RiskLevelMetric from '../RiskLevelMetric';

import './StateTooltip.css';

const TooltipMetricHorizontal = ({ label, value }) => {
  return (
    <div className="tooltip-metric-horizontal">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}

const TooltipMetricVertical = ({ label, value }) => {
  return (
    <div className="tooltip-metric-vertical">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}

export default function StateTooltip({ state, summary }) {
  return (
    <div className="state-tooltip">
      <div className="state-name extra-bold-text">{`${state.properties.name}`}</div>
      <div className="tooltip-content">
        <TooltipMetricHorizontal label={`Population`} value={Number.parseInt(summary.population).toLocaleString()} />
        <div className="tooltip-metric-group">
          <TooltipMetricVertical label={`New Cases`} value={Number.parseInt(summary.actuals.newCases).toLocaleString()} />
          <TooltipMetricVertical label={`New Deaths`} value={Number.parseInt(summary.actuals.newDeaths).toLocaleString()} />
          <TooltipMetricVertical label={`Total Cases`} value={Number.parseInt(summary.actuals.cases).toLocaleString()} />
          <TooltipMetricVertical label={`Total Deaths`} value={`${Number.parseInt(summary.actuals.deaths).toLocaleString()} (${Number.parseFloat((summary.actuals.deaths / summary.actuals.cases) * 100).toFixed(2)}% CFR)`} />
          <TooltipMetricVertical label={`Cases per 100K`} value={Number.parseInt(summary.metrics.caseDensity).toLocaleString()} />
          <TooltipMetricVertical label={`Infection Rate`} value={Number.parseInt(summary.metrics.infectionRate).toLocaleString()} />
          <TooltipMetricVertical label={`Vaccinated`} value={`${Number.parseInt(summary.metrics.vaccinationsCompletedRatio * 100).toFixed(2).toLocaleString()}%`} />
          <TooltipMetricVertical label={`Hospitalizations`} value={`${Number.parseInt(summary.actuals.hospitalBeds.currentUsageTotal).toLocaleString()}`} />
          <TooltipMetricVertical label={`ICU Patients`} value={`${Number.parseInt(summary.actuals.icuBeds.currentUsageTotal).toLocaleString()}`} />
        </div>
        <RiskLevelMetric label={`CDC Transmission`} riskLevel={summary.cdcTransmissionLevel} />
        <RiskLevelMetric label={`Overall Risk`} riskLevel={summary.riskLevels.overall} />
        <RiskLevelMetric label={`Infection Rate`} riskLevel={summary.riskLevels.infectionRate} />
        <RiskLevelMetric label={`Case Density`} riskLevel={summary.riskLevels.caseDensity} />
        <RiskLevelMetric label={`ICU Headroom`} riskLevel={summary.riskLevels.icuHeadroomRatio} />
        <RiskLevelMetric label={`ICU Capacity`} riskLevel={summary.riskLevels.icuCapacityRatio} />
        <RiskLevelMetric label={`Test Positivity`} riskLevel={summary.riskLevels.testPositivityRatio} />
        <RiskLevelMetric label={`Contract Tracing Capacity`} riskLevel={summary.riskLevels.contactTracerCapacityRatio} />
      </div>
    </div>
  )
}
