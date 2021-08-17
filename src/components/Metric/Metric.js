import React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';

import './Metric.css';

const spring = {
  type: "spring",
  stiffness: 500,
  damping: 30
};

export default class Metric extends React.Component {
  constructor(props) {
    super(props)
  }

  onClick = () => {
    if (!this.props.activateMetric) {
      return;
    }

    this.props.activateMetric(this.props.property);
  }

  render() {
    return (
      <div
        data-tour={this.props.dataTour}
        className={`metric ${this.props.label && this.props.label.toLowerCase().replace(' ', '-')} risk-level-${this.props.riskLevel}`}
        onClick={this.onClick}
        style={{ cursor: this.props.activateMetric ? 'pointer' : 'default' }}
      >
        <div className="icon-container">
          {this.props.isSelected && <motion.div
            layoutId="outline"
            className="icon-outline"
            key="icon-outline"
            initial={false}
            transition={spring}>
            <svg viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="28.5" fill="none" strokeWidth="3" stroke="black" />
            </svg>
          </motion.div>}
          <div className={`icon ${this.props.riskLevel !== undefined ? `risk-level-${this.props.riskLevel}` : ''}`}>{this.props.icon}</div>
        </div>
        <div className="label-container">
          <div className="label">{this.props.label}</div>
          <div className="value">{this.props.value}</div>
        </div>
      </div>
    )
  }
}
