import React, { useEffect } from 'react';
import Light from './NeueHaasDisplay-XThin.ttf';
import Regular from './NeueHaasDisplay-Roman.ttf';
import Bold from './NeueHaasDisplay-Bold.ttf';
import Black from './NeueHaasDisplay-Black.woff';

export default React.memo(() => {
  const style = document.createElement('style');

  style.innerHTML =
  `
    html, body, .visx-annotationlabel text {
      font-family: 'Neue Haas', sans-serif !important;
    }

    @font-face {
      font-family: 'Neue Haas Display Light';
      src: url(${Light}) format('truetype');
      font-weight: 100;
      font-style: normal;
    }

    @font-face {
      font-family: 'Neue Haas';
      src: url(${Regular}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }

    @font-face {
      font-family: 'Neue Haas';
      src: url(${Bold}) format('truetype');
      font-weight: 700;
      font-style: normal;
    }

    @font-face {
      font-family: 'Neue Haas';
      src: url(${Black}) format('woff');
      font-weight: 900;
      font-style: normal;
    }

    .light-text {
      font-weight: 100;
    }

    .bold-text {
      font-weight: 700;
    }

    .extra-bold-text {
      font-weight: 900;
    }
  `;

  document.head.appendChild(style);

  return null;
})
