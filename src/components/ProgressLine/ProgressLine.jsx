import React from 'react';

import './ProgressLine.css';

export default function ProgressLine({ width }) {
  return (
    <div class="progress-line" style={{ width: `${width}px` }}/>
  );
}
