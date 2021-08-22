import React, { forwardRef, useEffect } from 'react';
import { useWorker } from 'react-hooks-worker';
import { useSpring, animated } from 'react-spring';

import NationWorker from './Nation.Worker';

export const Nation = React.memo(forwardRef(({ setLoadingNation }, ref) => {
  const { result: path } = useWorker(NationWorker);

   useEffect(() => {
     if (!path) {
       return
     }

     setLoadingNation(false);
   }, [path])

   const { x } = useSpring({
      reset: false,
      reverse: false,
      from: { x: 0 },
      x: 1,
      delay: 200,
      config: { tension: 400, friction: 200 },
    })

   return path ?
     <animated.path
       key="nation"
       stroke="var(--white)"
       id="nation-path"
       fill="none"
       strokeWidth="1.25"
       strokeDasharray={8898}
       strokeDashoffset={x.to(x => (1 - x) * 8898)}
       d={path}
    /> : null;
}))
