import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DateTime } from 'luxon';
import { INITIAL_VALUE, TOOL_NONE } from 'react-svg-pan-zoom';
import Tour from 'reactour'
import { motion, AnimateSharedLayout } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import Favicon from 'react-favicon';
import { useWorker } from 'react-hooks-worker';

import { useToggle, useWindowSize } from '../../hooks';
import Fonts from '../Fonts';
import LoadingAnimation from '../LoadingAnimation';
import Map from '../Map';
import AppHeader from '../AppHeader';
import Metric from '../Metric';
import Stats from '../Stats';
import { TourSteps } from '../InteractiveHelp';
import PoweredBy from '../PoweredBy';
import { CountiesWorker } from '../Map/Counties';
import { Legend } from '../Legend';
import favicon from '../../site/favicon/favicon.ico';
import serviceworker from './service-worker.js';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(serviceworker);
}

import './Application.css';

export default function Application({ apiKey }) {
  const size = useWindowSize();
  const [value, setValue] = useState(INITIAL_VALUE);
  const [activeTool, activateTool] = useState(new URL(window.location).searchParams.get('tool') || TOOL_NONE);
  const [activeCounty, activateCounty] = useState(null);
  const [activeMetric, activateMetric] = useState(new URL(window.location).searchParams.get('metric') || 'NewCases');
  const [timeseries, activateTimeseries] = useState(null);
  const [summary, activateSummary] = useState(null);
  const [locationLock, setLocationLock] = useToggle(new URL(window.location).searchParams.get('location') ? true : false);
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [showStats, toggleStats] = useToggle(new URL(window.location).searchParams.get('stats') === 'true' || !new URL(window.location).searchParams.has('stats')  ? true : false);
  const [metricLevel, setMetricLevel] = useState(new URL(window.location).searchParams.get('level') || 'county');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showTooltips, toggleTooltips] = useToggle(new URL(window.location).searchParams.get('tips') === 'true' || !new URL(window.location).searchParams.has('tips')  ? true : false);
  const [stateSummaries, setStateSummaries] = useState([]);
  const [highlightedState, setHighlightedState] = useState(null);
  const [mapLayer, setMapLayer] = useState(new URL(window.location).searchParams.get('layer') || 'risk');
  const [loadingCounties, setLoadingCounties] = useState(true);
  const { result: counties } = useWorker(CountiesWorker, apiKey);
  const didMountRef = useRef(false);
  const viewer = useRef(null);
  const appHeader = useRef(null);
  const interactiveTour = useRef(null);
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  useHotkeys('1', setLocationLock);
  useHotkeys('2', () => activateTool('none'));
  useHotkeys('3', () => activateTool('pan'));
  useHotkeys('4', () => activateTool('zoom-in'));
  useHotkeys('5', () => activateTool('zoom-out'));
  useHotkeys('6', () => viewer.current.fitToViewer('center', 'center'));
  useHotkeys('7', toggleStats);
  useHotkeys('8', toggleTooltips);

  const steps = TourSteps({
    viewer,
    showIntro,
    activeCounty,
    currentLocation,
    showStats,
    toggleStats,
    showTooltips,
    toggleTooltips,
    findLocation: (e) => {
      if (!locationLock) {
        setLocationLock();
      } else {
        setLocationLock();

        setTimeout(() => {
          setLocationLock();
        }, 100);
      }
    }
  })

  useEffect(() => {
   if (!counties) {
     return;
   }

   if (loadingCounties && counties.length === 3220) {
     setLoadingCounties(false);
   } else if (!loadingCounties && counties.length !== 3220) {
     setLoadingCounties(true);
   }
  }, [counties])

  useEffect(() => {
    const controller = new AbortController();
    const url = `https://api.covidactnow.org/v2/states.json?apiKey=${apiKey}`

    fetch(
      url,
      { signal: controller.signal }
    )
    .then(response => response.json())
    .then(response => {
      response.forEach(r => r.lastUpdatedDate = DateTime.fromISO(r.lastUpdatedDate));
      setStateSummaries(response);
    })
    .catch(error => {
      console.error(error);
    })

    return (() => {
      try {
        controller.abort();
      } catch (err) {
        console.error(err);
      }
    })
  }, [])

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tool', activeTool)
    window.history.pushState({}, '', url);
  }, [activeTool]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('level', metricLevel)
    window.history.pushState({}, '', url);
  }, [metricLevel]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('stats', showStats.toString())
    window.history.pushState({}, '', url);
  }, [showStats]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('tips', showTooltips.toString())
    window.history.pushState({}, '', url);
  }, [showTooltips]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('metric', activeMetric)
    window.history.pushState({}, '', url);
  }, [activeMetric]);

  useEffect(() => {
    if (didMountRef.current) {
      const url = new URL(window.location);

      if (activeCounty) {
        url.searchParams.set('county', activeCounty.fips);
      } else {
        url.searchParams.delete('county');
      }

      window.history.pushState({}, '', url);
    } else {
      didMountRef.current = true
    }
  }, [activeCounty]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('layer', mapLayer)
    window.history.pushState({}, '', url);
  }, [mapLayer]);

  useEffect(() => {
    if (!currentLocation || !interactiveTour.current || !interactiveTour.current.state.isOpen) {
      return;
    }

    const step = interactiveTour.current.props.steps[interactiveTour.current.state.current];

    if (step && step.selector.indexOf('location-lock') > -1) {
      interactiveTour.current.gotoStep(interactiveTour.current.state.current + 1);
    }
  }, [currentLocation]);

  useEffect(() => {
    setTimeout(() => {
      const url = new URL(window.location);

      if (url.searchParams.has('county')) {
        return;
      }

      // setShowIntro(true);
      // setIsTourOpen(true);
    }, 10)
  }, [])

  const fitToViewer = () => {
    viewer.current.fitToViewer('center', 'center');
  }

  return (
    <div key="application" style={{ height: `${size.height}px`, width: `${size.width}px`, overflowY: 'hidden' }}>
      <Fonts key="fonts" />
      <Favicon key="favicon" url={favicon} />
      <PoweredBy style={{ position: 'absolute', bottom: '0px', left: '0px', zIndex: 1 }} />
      <Legend mapLayer={mapLayer} />
      <AnimateSharedLayout key="animate-layout" type="crossfade">
        <div className="app" key="app" style={{ height: `${size.height}px`, width: `${size.width}px`, overflowY: 'hidden' }}>
          {counties && <Map
            key="viewer"
            width={size.width}
            height={size.height}
            summary={summary}
            activeCounty={activeCounty}
            activeTool={activeTool}
            activateTool={activateTool}
            activateCounty={activateCounty}
            activeMetric={activeMetric}
            locationLock={locationLock}
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            locating={locating}
            setLocating={setLocating}
            isTourOpen={isTourOpen}
            stateSummaries={stateSummaries}
            showTooltips={showTooltips}
            highlightedState={highlightedState}
            setHighlightedState={setHighlightedState}
            mapLayer={mapLayer}
            counties={counties}
            loadingCounties={loadingCounties}
            ref={viewer}
            apiKey={apiKey}
          />}
          <AppHeader
            key="app-header"
            width={size.width}
            summary={summary}
            activeCounty={activeCounty}
            fitToViewer={fitToViewer}
            locationLock={locationLock}
            toggleLocationLock={setLocationLock}
            activeTool={activeTool}
            activateTool={activateTool}
            showStats={showStats}
            toggleStats={toggleStats}
            setIsTourOpen={setIsTourOpen}
            locating={locating}
            setLocating={setLocating}
            isTouchDevice={isTouchDevice}
            showTooltips={showTooltips}
            toggleTooltips={toggleTooltips}
            mapLayer={mapLayer}
            setMapLayer={setMapLayer}
            setHighlightedState={setHighlightedState}
            ref={appHeader}
          />
          {activeCounty &&
            <Stats
              key={`stats-${activeCounty.fips}`}
              width={size.width}
              height={size.height}
              relativeTo={appHeader}
              apiKey={apiKey}
              summary={summary}
              timeseries={timeseries}
              activateSummary={activateSummary}
              activateTimeseries={activateTimeseries}
              activeCounty={activeCounty}
              activeMetric={activeMetric}
              activateMetric={activateMetric}
              metricLevel={metricLevel}
              setMetricLevel={setMetricLevel}
              showStats={showStats}
              isTourOpen={isTourOpen}
              setHighlightedState={setHighlightedState}
          />}
        </div>
      </AnimateSharedLayout>
      <Tour
        ref={interactiveTour}
        accentColor="var(--teal)"
        rounded={15}
        steps={steps}
        isOpen={isTourOpen}
        onRequestClose={() => setIsTourOpen(false)}
        onBeforeClose={() => setShowIntro(false)}
        disableInteraction={true}
        showNumber={false}
      />
    </div>
  );
}
