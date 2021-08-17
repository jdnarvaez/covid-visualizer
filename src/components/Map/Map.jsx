import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_VALUE, ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { geoPath, geoBounds, geoAlbersUsa, geoCentroid } from 'd3-geo';
import { feature, mesh, bbox } from 'topojson-client';
import oboe from 'oboe';
import { Tooltip } from 'react-svg-tooltip';
import { GrLocationPin } from 'react-icons/gr';
import VisibilitySensor from 'react-visibility-sensor';

import LocationPin from './LocationPin';
import RiskLevel from '../RiskLevel';
import LoadingAnimation from '../LoadingAnimation';
import ProgressLine from '../ProgressLine';

import './Map.css';

const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = geoPath(projection);

export default React.forwardRef(({ apiKey, width, height, activeTool, activateTool, activeCounty, activateCounty, summary, activeMetric, locationLock, currentLocation, setCurrentLocation, setLocating, isTourOpen }, ref) => {
  const [viewerState, setViewerState] = useState(INITIAL_VALUE);
  const [baseMap, setBaseMap] = useState(undefined);
  const [counties, setCounties] = useState([]);
  const [countyHighlight, setCountyHighlight] = useState(null);
  const [countyShapes, setCountyShapes] = useState([]);
  const [parsing, setParsing] = useState(true);
  const didMountRef = useRef(false);
  const overlayRef = React.createRef();
  const valueUpdaterRef = React.createRef();

  useEffect(() => {
    if (!didMountRef.current) {
      return;
    }

    if (locationLock) {
      setParsing(true);
      setLocating(true);

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
              const county = counties.find(county => county.properties.fips === fips)

              if (county) {
                activateCounty(county);
              }
            }

            setParsing(false);
            setLocating(false);
          })
          .catch(err => {
            setParsing(false);
            setLocating(false);
          })
        } else {
          setParsing(false);
          setLocating(false);
        }
      }, error => {
        setParsing(false);
        setLocating(false);
        console.error(error);
      }, {
        enableHighAccuracy: true,
        timeout: 5000
      });
    } else {
      setCurrentLocation(undefined);
      setLocating(false);
    }
  }, [locationLock]);

  useEffect(() => {
    import(
      /* webpackChunkName: "basemap" */
      /* webpackMode: "lazy" */
      '../../data/processed/counties-10m.json'
    ).then(module => {
      const UnitedStates = module.default;

      UnitedStates.objects.counties.geometries.forEach(county => {
        if (!county.properties.state) {
          return;
        }

        Object.assign(county, feature(UnitedStates, county))
      })

      const map = (
        <g key="base-map" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none">
          {UnitedStates.objects.states.geometries.map(state => <path key={state.id} stroke="var(--white)" d={`${path(feature(UnitedStates, state))}`} fill="none" strokeWidth="1.25" />)}
          <path key="nation" stroke="var(--white)" d={`${path(feature(UnitedStates, UnitedStates.objects.nation))}`} fill="none" strokeWidth="1.25" />
        </g>
      )

      setCounties(UnitedStates.objects.counties.geometries);
      setBaseMap(map)
    })
  }, []);

  useEffect(() => {
    if (counties.length === 0) {
      return;
    }

    oboe(`https://api.covidactnow.org/v2/counties.json?apiKey=${apiKey}`)
    .node('{fips actuals metrics riskLevels}', (node, nodePath, ancestors) => {
      const county = counties.find(county => county.id === node.fips);

      if (county && county.properties.state) {
        countyShapes.push(
          <VisibilitySensor partialVisibility={true}>
            {({isVisible}) =>
              <path
                style={{ visibility: isVisible ? 'visible' : 'hidden' }}
                key={county.id}
                id={county.id}
                className={`county-shape ${RiskLevel.valueOf(node.riskLevels.overall)}`}
                fillOpacity=".8"
                strokeWidth=".25"
                pointerEvents="none"
                zIndex="1"
                d={`${path(county)}`}
              />
            }
          </VisibilitySensor>
        )

        setCountyShapes([...countyShapes])
      }
    })
    .on('done', function(json) {
      this.forget()
      setParsing(false)
    });
  }, [counties]);

  useEffect(() => {
    if (!baseMap) {
      return;
    }

    const url = new URL(window.location);
    const initialView = url.searchParams.get('view')
    const initialCounty = url.searchParams.get('county')
    const location = url.searchParams.get('location')

    if (initialView) {
      const value = JSON.parse(JSON.stringify(ref.current.getValue()));
      Object.assign(value, JSON.parse(atob(initialView)));
      ref.current.setValue(value);
    } else {
      ref.current.fitToViewer('center', 'center');
    }

    if (initialCounty) {
      const county = counties.find(c => c.id === initialCounty);

      if (county) {
        activateCounty(county);
      }
    }

    if (location) {
      setCurrentLocation(JSON.parse(atob(location)));
    }
  }, [baseMap]);

  useEffect(() => {
    if (!activeCounty) {
      return;
    }

    const centroid = path.centroid(activeCounty);

    setCountyHighlight(
      <path
        data-tour="county-highlight"
        key={`selected-county-${activeCounty.id}`}
        style={{ transformOrigin: `${centroid[0]}px ${centroid[1]}px` }}
        className={`selected-county hithere ${summary ? RiskLevel.valueOf(summary.riskLevels.overall) : ''}`}
        fillOpacity="1"
        strokeWidth=".125"
        pointerEvents="none"
        d={`${path(activeCounty)}`}
      />
    )
  }, [activeCounty, summary])

  const onChangeValue = (value) => {
    if (baseMap) {
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
    // console.log(event);
  }

  const onClick = (event) => {
    const id = event.originalEvent.target.getAttribute('id');
    const county = counties.find(county => county.id === id);

    if (county) {
      activateCounty(county);
    }
  }

  return (
    baseMap ? (
    <React.Fragment>
      {parsing && <ProgressLine width={width} />}
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
        <svg key="svg-map" viewBox="0 0 975 610" style={{ pointerEvents: 'none' }} data-tip data-for="hover-county-tooltip">
          <defs>
            <linearGradient id="solids" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
              <stop offset="33%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
              <stop offset="33%" style="stop-color:rgb(0,255,0);stop-opacity:1" />
              <stop offset="67%" style="stop-color:rgb(0,255,0);stop-opacity:1" />
              <stop offset="67%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgb(0,0,255);stop-opacity:1" />
            </linearGradient>
          </defs>
          <g>
            {countyShapes}
          </g>
          {baseMap}
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
    </React.Fragment>
    ) : <LoadingAnimation />
  )
})

// <g className="location-pin" transform={`translate(${currentLocation.x}, ${currentLocation.y})`}><LocationPin /></g>
