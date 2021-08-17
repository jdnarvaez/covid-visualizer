import React from 'react';
import { motion } from 'framer-motion';

import './Metric.css';

const spring = {
  type: "spring",
  stiffness: 500,
  damping: 30
};

export default function Metric({ activeMetric, activateMetric, property, label, value, riskLevel, icon }) {
  const onClick = () => {
    if (property) {
      activateMetric(property)
    }
  }

  return (
    <div className={`metric ${label && label.toLowerCase().replace(' ', '-')}`} onClick={onClick}>
      <div className="icon-container">
        {activeMetric === property && <motion.div
          layoutId="outline"
          className="icon-outline"
          initial={false}
          transition={spring}>
          <svg viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28.5" fill="none" strokeWidth="3" stroke="black" />
          </svg>
        </motion.div>}
        <div className={`icon ${riskLevel !== undefined ? `risk-level-${riskLevel}` : ''}`}>{icon}</div>
      </div>
      <div className="label-container">
        <div className="label">{label}</div>
        <div className="value">{value}</div>
      </div>
    </div>
  )
}
