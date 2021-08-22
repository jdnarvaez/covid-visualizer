import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_VALUE, ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { TooltipWithBounds } from '@visx/tooltip';

import RiskLevel from '../RiskLevel';
import LoadingAnimation from '../LoadingAnimation';
import ProgressLine from '../ProgressLine';
import { StateTooltip } from '../StateTooltip';

import { Nation } from './Nation';
import { States } from './States';
import { Counties } from './Counties';

import './Map.css';

export default React.forwardRef(({
  apiKey,
  width,
  height,
  activeTool,
  activateTool,
  activeCounty,
  activateCounty,
  summary,
  activeMetric,
  locationLock,
  currentLocation,
  setCurrentLocation,
  locating,
  setLocating,
  isTourOpen,
  stateSummaries,
  showTooltips,
  highlightedState,
  setHighlightedState,
  mapLayer,
  counties,
  loadingCounties,

}, ref) => {
  const [viewerState, setViewerState] = useState(INITIAL_VALUE);
  const [countyHighlight, setCountyHighlight] = useState(null);
  const [stateHighlight, setStateHighlight] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [loadingNation, setLoadingNation] = useState(true);
  const didMountRef = useRef(false);
  const valueUpdaterRef = React.createRef();
  const states = useRef(null);

  useEffect(() => {
    if (!didMountRef.current) {
      return;
    }

    if (locationLock) {
      setLocating(true);

      import(
        /* webpackChunkName: "d3-geo" */
        /* webpackMode: "lazy" */
        'd3-geo'
      ).then(({ geoPath, geoAlbersUsa }) => {
        const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
        const path = geoPath(projection);

        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          const coords = projection([longitude,latitude]);
          const location = { x: coords[0], y: coords[1] }
          ref.current.fitSelection(location.x - 25, location.y - 25, 75, 75);
          setCurrentLocation(location);
          const url = new URL(window.location);
          url.searchParams.set('location', btoa(JSON.stringify(location)))
          window.history.pushState({}, '', url);

          if (counties) {
            fetch(`https://geo.fcc.gov/api/census/area?lat=${latitude}&lon=${longitude}&format=json`)
            .then(response => response.json())
            .then(response => {
              if (response.results) {
                const location = response.results[0];
                const fips = location.county_fips;
                const county = counties.find(c => c.fips === fips);

                if (county) {
                  activateCounty(county);
                }
              }

              setLocating(false);
            })
            .catch(err => {
              setLocating(false);
            })
          } else {
            setLocating(false);
          }
        }, error => {
          setLocating(false);
          console.error(error);
        }, {
          enableHighAccuracy: true,
          timeout: 5000
        });
      })
      .catch(error => {
        setLocating(false);
        console.error(error);
      })
    } else {
      setCurrentLocation(undefined);
      setLocating(false);
    }
  }, [locationLock]);

  useEffect(() => {
    const url = new URL(window.location);
    const initialView = url.searchParams.get('view')

    if (initialView) {
      const value = JSON.parse(JSON.stringify(ref.current.getValue()));
      Object.assign(value, JSON.parse(atob(initialView)));
      ref.current.setValue(value);
    } else {
      ref.current.fitToViewer('center', 'center');
    }
  }, []);

  useEffect(() => {
    if (loadingCounties) {
      return;
    }

    const url = new URL(window.location);
    const fips = url.searchParams.get('county');
    const location = url.searchParams.get('location')

    if (fips) {
      const county = counties.find(c => c.fips === fips);

      if (county) {
        activateCounty(county);
      }
    }

    if (location) {
      setCurrentLocation(JSON.parse(atob(location)));
    }
  }, [loadingCounties])

  useEffect(() => {
    if (!activeCounty) {
      return;
    }

    setCountyHighlight(
      <path
        data-tour="county-highlight"
        key={`selected-county-${activeCounty.fips}`}
        style={{ transformOrigin: `${activeCounty.centroid[0]}px ${activeCounty.centroid[1]}px` }}
        className={`selected-county hithere ${summary ? RiskLevel.valueOf(summary.riskLevels.overall) : ''}`}
        fillOpacity="1"
        strokeWidth=".125"
        pointerEvents="none"
        d={activeCounty.path}
      />
    )
  }, [activeCounty, summary])

  useEffect(() => {
    if (!highlightedState) {
      setStateHighlight(null);
      setTooltip(null);
      return;
    }

    setStateHighlight(
      <path
        data-tour="state-highlight"
        key={`selected-state-${highlightedState.fips}`}
        style={{ transformOrigin: `${highlightedState.centroid[0]}px ${highlightedState.centroid[1]}px` }}
        className={`selected-state`}
        fillOpacity="0"
        fill="none"
        strokeWidth="3"
        pointerEvents="none"
        stroke="white"
        d={highlightedState.path}
      />
    )
  }, [highlightedState])

  useEffect(() => {
    const node = document.querySelector('.selected-state');

    if (!node || !highlightedState || stateSummaries.length === 0 || !showTooltips) {
      setTooltip(null);
      return;
    }

    const rect = document.querySelector('.selected-state').getBoundingClientRect();
    var left = rect.left + rect.width;
    var top = rect.top + rect.height;
    const leftOverflow = window.innerWidth - (left);
    const topOverflow = window.innerHeight - (top);

    if (leftOverflow < 0) {
      left += leftOverflow;
    }

    if (topOverflow < 0) {
      top += topOverflow;
    }

    const stateSummary = stateSummaries.find(s => s.fips === highlightedState.fips);

    setTooltip(<TooltipWithBounds
      key={Math.random()}
      left={left}
      top={top}
      className="overlay map-tooltip"
    >
      <StateTooltip state={highlightedState} summary={stateSummary} />
    </TooltipWithBounds>)

  }, [stateHighlight, highlightedState, stateSummaries, showTooltips])

  const onChangeValue = (value) => {
    if (!loadingNation) {
      if (didMountRef.current) {
        clearTimeout(valueUpdaterRef.current)

        valueUpdaterRef.current = setTimeout(() => {
          const { a, b, c, d, e, f } = value;
          const view = { a, b, c, d, e, f };
          const url = new URL(window.location);
          url.searchParams.set('view', btoa(JSON.stringify(view)))
          window.history.pushState({}, '', url);
        }, 1000);
      } else {
        didMountRef.current = true
      }
    }

    setViewerState(value);
  }

  const onMouseMove = (event) => {
    const fips = event.originalEvent.target.getAttribute('state-fips');

    if (fips && states.current) {
      setHighlightedState(states.current.byFips(fips));
    } else {
      setHighlightedState(null)
    }
  }

  const onClick = (event) => {
    if (!counties) {
      return;
    }

    const fips = event.originalEvent.target.getAttribute('id');
    const county = counties.find(c => c.fips === fips);

    if (county) {
      activateCounty(county);
    }
  }

  return (
    <>
      {(loadingNation || locating || loadingCounties) && <ProgressLine width={width} />}
      {tooltip}
      <ReactSVGPanZoom
        key="viewer"
        className={`map ${isTourOpen ? 'hide-counties' : 'show-counties' }`}
        ref={ref}
        width={width}
        height={height}
        background="transparent"
        detectAutoPan={false}
        tool={activeTool}
        onChangeTool={activateTool}
        value={viewerState}
        toolbarProps={{ position: 'none' }}
        miniatureProps={{ position: 'none' }}
        onChangeValue={onChangeValue}
        onMouseMove={onMouseMove}
        onClick={onClick}
      >
        <svg key="svg-map" viewBox="0 0 975 610" style={{ pointerEvents: 'none' }}>
          {!loadingNation && <Counties key={`counties-map`} mapLayer={mapLayer} counties={counties} />}
          <g key="base-map" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none">
            <Nation key="nation" setLoadingNation={setLoadingNation} />
            <States key="states" ref={states} />
          </g>
          {stateHighlight}
          {countyHighlight}
          {currentLocation && <g>
            <circle data-tour="current-location" cx={currentLocation.x - .25} cy={currentLocation.y - .25} r="1.5" fill="none" stroke="none" />
            <circle cx={currentLocation.x - .25} cy={currentLocation.y - .25} fill="none" r=".5" stroke="var(--cyan)" strokeWidth=".5">
              <animate attributeName="r" from=".175" to="2" dur="1.5s" begin="0s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="1" to="0" dur="1.5s" begin="0s" repeatCount="indefinite"/>
            </circle>
            <circle cx={currentLocation.x - .25} cy={currentLocation.y - .25} stroke="var(--cyan)" fill="var(--light)" r=".5" strokeWidth=".25">
              <animate
                attributeName="r"
                begin="0s"
                values=".5;.125;.5"
                keyTimes="0;0.5;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>}
        </svg>
      </ReactSVGPanZoom>
    </>
  )
})
