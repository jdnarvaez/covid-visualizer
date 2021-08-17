import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DateTime } from 'luxon';
import useResizeObserver from 'use-resize-observer';
import { INITIAL_VALUE, TOOL_NONE } from 'react-svg-pan-zoom';
import Tour from 'reactour'
import { geoPath, geoBounds, geoAlbersUsa, geoCentroid } from 'd3-geo';
import { feature, mesh, bbox } from 'topojson-client';
import { timeFormat } from 'd3-time-format';
import { scaleQuantize } from 'd3-scale';
import { motion, AnimateSharedLayout } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import Favicon from 'react-favicon';
import { useToggle, useWindowSize } from '../../hooks';

import Fonts from '../Fonts';
import favicon from '../../site/favicon/favicon.ico';


import LoadingAnimation from '../LoadingAnimation';
import Map from '../Map';
import AppHeader from '../AppHeader';
import Metric from '../Metric';
import Stats from '../Stats';
import { TourSteps } from '../InteractiveHelp';

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
  const didMountRef = useRef(false);
  const viewer = useRef(null);
  const appHeader = useRef(null);
  const interactiveTour = useRef(null);

  useHotkeys('1', setLocationLock);
  useHotkeys('2', () => activateTool('none'));
  useHotkeys('3', () => activateTool('pan'));
  useHotkeys('4', () => activateTool('zoom-in'));
  useHotkeys('5', () => activateTool('zoom-out'));
  useHotkeys('6', () => viewer.current.fitToViewer('center', 'center'));
  useHotkeys('7', toggleStats);

  const steps = TourSteps({
    viewer,
    showIntro,
    activeCounty,
    currentLocation,
    showStats,
    toggleStats,
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
    url.searchParams.set('metric', activeMetric)
    window.history.pushState({}, '', url);
  }, [activeMetric]);

  useEffect(() => {
    if (didMountRef.current) {
      const url = new URL(window.location);

      if (activeCounty) {
        url.searchParams.set('county', activeCounty.id);
      } else {
        url.searchParams.delete('county');
      }

      window.history.pushState({}, '', url);
    } else {
      didMountRef.current = true
    }
  }, [activeCounty]);

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

      setShowIntro(true);
      setIsTourOpen(true);
    }, 10)
  }, [])

  const fitToViewer = () => {
    viewer.current.fitToViewer('center', 'center');
  }

  return (
    <div key="application" style={{ height: `${size.height}px`, width: `${size.width}px`, overflowY: 'hidden' }}>
      <Fonts key="fonts" />
      <Favicon key="favicon" url={favicon} />
      <AnimateSharedLayout key="animate-layout">
        <div className="app" key="app" style={{ height: `${size.height}px`, width: `${size.width}px`, overflowY: 'hidden' }}>
          <Map
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
            ref={viewer}
            apiKey={apiKey}
          />
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
            ref={appHeader}
          />
          {activeCounty &&
            <Stats
              key={`stats-${activeCounty.id}`}
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
