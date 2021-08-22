import React, { forwardRef, useImperativeHandle } from 'react';
import { useWorker } from 'react-hooks-worker';
import { useSpring, animated } from 'react-spring';

import StatesWorker from './States.Worker';

export const States = React.memo(forwardRef((props, ref) => {
  const { result: states } = useWorker(StatesWorker);

  useImperativeHandle(
    ref,
    () => ({
       byFips(fips) {
         return states && states.find(state => state.fips === fips);
       }
     }),
     [states]
   );

   const { x } = useSpring({
      reset: false,
      reverse: false,
      from: { x: 0 },
      x: 1,
      delay: 200,
      config: { tension: 400, friction: 200 },
    });

   return states ? states.map(state =>
     <animated.path
       key={state.fips}
       id={state.fips}
       className="state-path"
       stroke="var(--white)"
       d={state.path}
       fill="none"
       strokeWidth="1.25"
       pointerEvents="none"
       strokeDasharray={state.length}
       strokeDashoffset={x.to(x => (1 - x) * state.length)}
     />
   ) : null;
}))
