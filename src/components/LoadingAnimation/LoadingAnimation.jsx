import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import './LoadingAnimation.css';

export default class LoadingAnimation extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1, transition: { duration: 0.15 } }}
        transition={{ duration: 0.15 }}
        className="loading-animation"
      >
      <div className="animation-layout">
        <div className="loader circle">
          <svg viewBox="0 0 80 80">
              <circle id="test" cx="40" cy="40" r="32"></circle>
          </svg>
        </div>
        <div className="loader triangle">
            <svg viewBox="0 0 86 80">
                <polygon points="43 8 79 72 7 72"></polygon>
            </svg>
        </div>

        <div className="loader rect">
            <svg viewBox="0 0 80 80">
                <rect x="8" y="8" width="64" height="64"></rect>
            </svg>
        </div>

        <div className="loader cross">
          <svg viewBox="0 0 80 80">
              <line x1="0" y1="0" x2="80" y2="80" />
              <line x1="0" y1="80" x2="80" y2="0" />
          </svg>
          </div>
        </div>




</motion.div>
    )
  }
}

// <div className="sk-chase">
//   <div className="sk-chase-dot"></div>
//   <div className="sk-chase-dot"></div>
//   <div className="sk-chase-dot"></div>
//   <div className="sk-chase-dot"></div>
//   <div className="sk-chase-dot"></div>
//   <div className="sk-chase-dot"></div>
// </div>
