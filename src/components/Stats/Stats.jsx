import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DateTime, Interval } from 'luxon';
import { useGesture } from 'react-use-gesture';
import AbortController from 'abort-controller';

import { IoIosPeople } from 'react-icons/io';
import { BiPlusMedical } from 'react-icons/bi';
import { GiDeathSkull, GiPersonInBed, GiBed } from 'react-icons/gi';
import { GrCubes } from 'react-icons/gr';
import { FaSyringe, FaBiohazard, FaPercent } from 'react-icons/fa';

import { TiArrowMinimise, TiArrowMaximise } from 'react-icons/ti';

import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  XYChart,
  Tooltip,
  AnimatedAnnotation,
  Annotation,
  AnnotationLabel,
  AnnotationConnector,
  AnnotationCircleSubject,
  AnnotationLineSubject
} from '@visx/xychart';

import Metric from '../Metric';
import LoadingAnimation from '../LoadingAnimation';

import './Stats.css';

export default function Stats({ apiKey, relativeTo, activeCounty, activeMetric, activateMetric, summary, activateSummary, timeseries, activateTimeseries, width, height, metricLevel, setMetricLevel, showStats, isShowTour, setHighlightedState }) {
  const [summaryAbortController, setSummaryAbortController] = useState(undefined);
  const [timeseriesAbortController, setTimeseriesAbortController] = useState(undefined);
  const [annotations, setAnnotations] = useState({});
  const [statsWidth, setStatsWidth] = useState(new URL(window.location).searchParams.has('w') ? parseFloat(new URL(window.location).searchParams.get('w')) : .3);
  const [maximized, setMaximized] = useState(new URL(window.location).searchParams.has('max') ? true : false);
  const graphHeight = 350;
  const resizeHandleRef = useRef(null);

  useEffect(() => {
    import(
      /* webpackChunkName: "annotations" */
      /* webpackMode: "lazy" */
      '../../data/annotations.json'
    ).then(module => setAnnotations(module.default))
  }, []);

  const fetchSummary = () => {
    const controller = new AbortController();
    let url;

    switch (metricLevel) {
      case 'state':
        url = `https://api.covidactnow.org/v2/state/${activeCounty.state.code}.json?apiKey=${apiKey}`;
      break;
      case 'country':
        url = `https://api.covidactnow.org/v2/country/US.json?apiKey=${apiKey}`;
      break;
      case 'cbsa':
        if (activeCounty.cbsa) {
          url = `https://api.covidactnow.org/v2/cbsa/${activeCounty.cbsa.fips}.json?apiKey=${apiKey}`;
        }
      break;
      case 'county':
      default:
        url = `https://api.covidactnow.org/v2/county/${activeCounty.fips}.json?apiKey=${apiKey}`;
      break;
    }

    if (!url) {
      return;
    }

    fetch(
      url,
      { signal: controller.signal }
    )
    .then(response => response.json())
    .then(response => {
      response.lastUpdatedDate = DateTime.fromISO(response.lastUpdatedDate);
      setSummaryAbortController(undefined)
      activateSummary(response);
    })
    .catch(error => {
      console.error(error);
    })

    setSummaryAbortController(controller);
  }

  const fetchTimeseries = () => {
    const controller = new AbortController();
    let url;

    switch (metricLevel) {
      case 'state':
        url = `https://api.covidactnow.org/v2/state/${activeCounty.state.code}.timeseries.json?apiKey=${apiKey}`;
      break;
      case 'cbsa':
        if (activeCounty.cbsa) {
          url = `https://api.covidactnow.org/v2/cbsa/${activeCounty.cbsa.fips}.timeseries.json?apiKey=${apiKey}`;
        }

        break;
      case 'country':
        url = `https://api.covidactnow.org/v2/country/US.timeseries.json?apiKey=${apiKey}`;
      break;
      case 'county':
      default:
        url = `https://api.covidactnow.org/v2/county/${activeCounty.fips}.timeseries.json?apiKey=${apiKey}`;
      break;
    }

    if (!url) {
      return;
    }

    fetch(
      url,
      { signal: controller.signal }
    )
    .then(response => response.json())
    .then(response => {
      response.lastUpdatedDate = DateTime.fromISO(response.lastUpdatedDate);
      setTimeseriesAbortController(undefined)
      activateTimeseries(response);
    })
    .catch(error => {
      console.error(error);
    })

    setTimeseriesAbortController(controller);
  }

  useEffect(() => {
    if (summaryAbortController) {
      try {
        summaryAbortController.abort();
      } catch (err) {
        console.error(err);
      }
    }

    if (timeseriesAbortController) {
      try {
        timeseriesAbortController.abort();
      } catch (err) {
        console.error(err);
      }
    }

    if (!activeCounty || !activeCounty.fips) {
      if (!summary) {
        return;
      } else {
        return setSummary(undefined);
      }
    }

    fetchSummary();
    fetchTimeseries();

    // cancel requests
    return (() => {
      if (summaryAbortController) {
        try {
          summaryAbortController.abort();
        } catch (err) {
          console.error(err);
        }
      }

      if (timeseriesAbortController) {
        try {
          timeseriesAbortController.abort();
        } catch (err) {
          console.error(err);
        }
      }
    })
  }, [activeCounty, metricLevel]);

  const style = {
    maxHeight: `${height - 90}px`,
    width: maximized ? `${width - 60}px` : `${statsWidth * width}px`
  }

  if (relativeTo && relativeTo.current) {
    const rect = relativeTo.current.getBoundingClientRect();
    style.top = `${rect.top + rect.height + 15}px`;
    style.maxHeight = `${height - (rect.top + rect.height) - 60}px`;
  } else {
    return null;
  }

  let data = null;
  let yAccessor = null;
  let yLabel = null;

  let secondaryData = null;
  let secondaryYAccessor = null;

  if (activeMetric && timeseries) {
    switch (activeMetric) {
      case 'NewCases':
        data = timeseries.actualsTimeseries;
        yAccessor = (d) => d.newCases;
        yLabel = 'New Cases';
        break;
      case 'NewDeaths':
        data = timeseries.actualsTimeseries;
        yAccessor = (d) => d.newDeaths;
        yLabel = 'New Deaths';
        break;
      case 'Cases':
        data = timeseries.actualsTimeseries;
        yAccessor = (d) => d.cases;
        yLabel = 'Cases';
        break;
      case 'Deaths':
        data = timeseries.actualsTimeseries;
        yAccessor = (d) => d.deaths;
        yLabel = 'Deaths';
        break;
      case 'Vaccinated':
        data = timeseries.actualsTimeseries;
        yAccessor = (d) => d.vaccinationsCompleted;
        yLabel = 'Vaccinations Completed';
        break;
      case 'InfectionRate':
        data = timeseries.metricsTimeseries;
        yAccessor = (d) => d.infectionRate;
        yLabel = 'Infection Rate';
        break;
      case 'CaseDensity':
        data = timeseries.metricsTimeseries;
        yAccessor = (d) => d.caseDensity;
        yLabel = 'Cases per 100K';
        break;
      case 'TestPostivity':
        data = timeseries.metricsTimeseries;
        yAccessor = (d) => d.testPositivityRatio;
        yLabel = 'Test Postivity';
        break;
      case 'HospitalBeds':
        data = timeseries.actualsTimeseries.filter(d => d.hospitalBeds && d.hospitalBeds.currentUsageTotal !== null);
        yAccessor = (d) => d.hospitalBeds.currentUsageTotal;
        yLabel = 'Hospital Beds';

        secondaryData = timeseries.actualsTimeseries.filter(d => d.hospitalBeds && d.hospitalBeds.currentUsageCovid !== null);
        secondaryYAccessor = (d) => d.hospitalBeds && d.hospitalBeds.currentUsageCovid;
        break;
      case 'ICUBeds':
        data = timeseries.actualsTimeseries.filter(d => d.icuBeds && d.icuBeds.currentUsageTotal !== null)
        yAccessor = (d) => d.icuBeds && d.icuBeds.currentUsageTotal;
        yLabel = 'ICU Beds';

        secondaryData = timeseries.actualsTimeseries.filter(d => d.icuBeds && d.icuBeds.currentUsageCovid !== null);
        secondaryYAccessor = (d) => d.icuBeds && d.icuBeds.currentUsageCovid;
        break;
    }
  }

  let graphicAnnotations = [];

  if (data && summary && annotations[summary.state]) {
    Object.keys(annotations[summary.state]).forEach(date => {
      const datum = data.find(d => d.date === date);

      if (!datum) {
        return;
      }

      graphicAnnotations.push(
        <Annotation
          key={date}
          dataKey="data"
          datum={datum}
          dx={-10}
          dy={-10}
        >
          <AnnotationLabel
            title={summary.state}
            subtitle={annotations[summary.state][date]}
            showAnchorLine={false}
            backgroundFill="var(--light)"
            horizontalAnchor="auto"
            anchorLineStroke={'var(--dark)'}
            backgroundProps={{ stroke: 'var(--dark)' }}
          />
          <AnnotationLineSubject orientation="vertical" />
          <AnnotationConnector type="elbow" />
        </Annotation>
      )
    })
  }

  const toggleMaximized = () => {
    const url = new URL(window.location);

    if (maximized) {
      url.searchParams.delete('max');
    } else {
      url.searchParams.set('max', true);
    }

    setMaximized(!maximized);
    window.history.pushState({}, '', url);
  }

  const bind = useGesture({
    onDrag: ({ xy : [x,], offset, memo }) => {
      const rect = resizeHandleRef.current.getBoundingClientRect();
      const leftAnchor = memo !== undefined ? memo : rect.left - x - 15;
      const newWidth = 1 - ((x - leftAnchor) / width);
      const url = new URL(window.location);

      if (newWidth >= ((width - 60) / width)) {
        setMaximized(true);
        url.searchParams.delete('w')
        url.searchParams.set('max', true)
      } else if ((newWidth * width) >= 300) {
        url.searchParams.delete('max')
        url.searchParams.set('w', newWidth)
        setStatsWidth(newWidth);
        setMaximized(false);
      }

      window.history.pushState({}, '', url);
      window.dispatchEvent(new Event('resize'));
      return leftAnchor;
    }
  }, { drag: { axis: 'x' } });

  return (
    <div
      key={`summary-${activeCounty.fips}`}
      style={style}
      className={`summary overlay ${showStats ? 'show' : 'hide' }`}
      onMouseEnter={() => setHighlightedState(null)}
    >
      <div className="resize-handle" {...bind()} ref={resizeHandleRef} data-tour="resize-handle" />
      <div className="min-max" onClick={toggleMaximized} data-tour="toggle-maximise">{maximized ? <TiArrowMinimise /> : <TiArrowMaximise />}</div>
        {!summary && <LoadingAnimation />}
        {summary && <React.Fragment>
          <div className="last-updated" data-tour="last-updated">
            <div className="last-updated-caption light-text">as of</div>
            <div className="last-updated-date bold-text">{summary.lastUpdatedDate.toLocaleString(DateTime.DATE_HUGE)}</div>
          </div>
          <div className="metric-level bold-text" data-tour="metric-level">
            <div className={`metric-level-selector ${metricLevel === 'country' ? 'active' : ''}`} onClick={() => setMetricLevel('country')}>
              <div className={`country-level`}>Country</div>
              <div className="active-indicator" />
            </div>
            <div className={`metric-level-selector ${metricLevel === 'state' ? 'active' : ''}`} onClick={() => setMetricLevel('state')}>
              <div className={`state-level`}>State</div>
              <div className="active-indicator" />
            </div>
            {activeCounty && activeCounty.cbsa &&
              <div className={`metric-level-selector ${metricLevel === 'cbsa' ? 'active' : ''}`} onClick={() => setMetricLevel('cbsa')}>
                <div className={`cbsa-level`}>Region</div>
                <div className="active-indicator" />
              </div>
            }
            <div className={`metric-level-selector ${metricLevel === 'county' ? 'active' : ''}`} onClick={() => setMetricLevel('county')}>
              <div className={`county-level`}>County</div>
              <div className="active-indicator" />
            </div>
          </div>
          <div className="stats-content">
            <div className="metrics" data-tour="daily-stats">
              <Metric dataTour="example-metric" icon={<BiPlusMedical />} isSelected={'NewCases' === activeMetric} property="NewCases" label="New Cases" value={`${Number.parseInt(summary.actuals.newCases).toLocaleString()}`} activateMetric={activateMetric} activeMetric={activeMetric} />
              <Metric icon={<GiDeathSkull />} isSelected={'NewDeaths' === activeMetric} property="NewDeaths" label="New Deaths" value={`${Number.parseInt(summary.actuals.newDeaths).toLocaleString()}`} activateMetric={activateMetric} activeMetric={activeMetric} />
            </div>
            <div className="metrics" data-tour="general-metrics">
              <Metric icon={<IoIosPeople />} label="Population" value={`${Number.parseInt(summary.population).toLocaleString()}`} />
              <Metric icon={<BiPlusMedical />} isSelected={'Cases' === activeMetric} property="Cases" label="Cases" value={`${Number.parseInt(summary.actuals.cases).toLocaleString()} (${Number.parseFloat((summary.actuals.cases / summary.population) * 100).toFixed(2)}%)`} activateMetric={activateMetric} activeMetric={activeMetric} />
              <Metric icon={<FaSyringe />} isSelected={'Vaccinated' === activeMetric} property="Vaccinated" label="Vaccinated" value={`${Number.parseInt(summary.actuals.vaccinationsCompleted).toLocaleString()} (${Number.parseFloat((summary.actuals.vaccinationsCompleted / summary.population) * 100).toFixed(2)}%)`} activateMetric={activateMetric} activeMetric={activeMetric} />
              <Metric icon={<GiDeathSkull />} isSelected={'Deaths' === activeMetric} property="Deaths" label="Deaths" value={`${Number.parseInt(summary.actuals.deaths).toLocaleString()} (${Number.parseFloat((summary.actuals.deaths / summary.actuals.cases) * 100).toFixed(2)}% CFR)`} activateMetric={activateMetric} activeMetric={activeMetric} />
              <Metric icon={<GrCubes />} isSelected={'CaseDensity' === activeMetric} property="CaseDensity" label="Cases per 100K" riskLevel={summary.riskLevels.caseDensity} value={summary.metrics.caseDensity} activateMetric={activateMetric} activeMetric={activeMetric} />
              <Metric icon={<FaBiohazard />} isSelected={'InfectionRate' === activeMetric} property="InfectionRate" label="Infection Rate (Rt)" riskLevel={summary.riskLevels.infectionRate} value={`${summary.metrics.infectionRateCI90}  (up to ${summary.metrics.infectionRate})`} activateMetric={activateMetric} activeMetric={activeMetric} />
              <Metric icon={<FaPercent />} isSelected={'TestPostivity' === activeMetric} property="TestPostivity" label="Test Positivity" riskLevel={summary.riskLevels.testPositivityRatio} value={`${Number.parseFloat(summary.metrics.testPositivityRatio * 100).toFixed(2)}%`} activateMetric={activateMetric} activeMetric={activeMetric} />
            </div>
            <div className="metrics" data-tour="hospital-metrics">
              <Metric icon={<GiBed />} isSelected={'HospitalBeds' === activeMetric} property="HospitalBeds" label="Hospital Beds" value={`${Number.parseInt(summary.actuals.hospitalBeds.capacity).toLocaleString()} (${Number.parseFloat((summary.actuals.hospitalBeds.currentUsageTotal / summary.actuals.hospitalBeds.capacity) * 100).toFixed(0)}% Full, ${Number.parseFloat((summary.actuals.hospitalBeds.currentUsageCovid / summary.actuals.hospitalBeds.capacity) * 100).toFixed(0)}% COVID, ${Number.parseFloat(summary.actuals.hospitalBeds.typicalUsageRate * 100).toFixed(0)}% Typical)`} activateMetric={activateMetric} activeMetric={activeMetric} />
              <Metric icon={<GiPersonInBed />} isSelected={'ICUBeds' === activeMetric} property="ICUBeds" label="ICU Beds" riskLevel={summary.riskLevels.icuCapacityRatio} value={`${Number.parseInt(summary.actuals.icuBeds.capacity).toLocaleString()} (${Number.parseFloat((summary.actuals.icuBeds.currentUsageTotal / summary.actuals.icuBeds.capacity) * 100).toFixed(0)}% Full, ${Number.parseFloat((summary.actuals.icuBeds.currentUsageCovid / summary.actuals.icuBeds.capacity) * 100).toFixed(0)}% COVID, ${Number.parseFloat(summary.actuals.icuBeds.typicalUsageRate * 100).toFixed(0)}% Typical)`} activateMetric={activateMetric} activeMetric={activeMetric} />
            </div>
            {data && <div className="graphs" data-tour="graphs">
              <XYChart key="metrics-chart" height={graphHeight} xScale={{ type: "time" }} yScale={{ type: "linear" }} style={{ height: '375px' }}>
                <AnimatedGrid columns={false} numTicks={5} />
                <AnimatedAxis orientation="bottom" numTicks={5} />
                <AnimatedAxis orientation="right" numTicks={5} />
                <AnimatedAxis orientation="left" label={yLabel} numTicks={0} />
                <AnimatedLineSeries
                  dataKey="data"
                  data={data}
                  xAccessor={(d) => new Date(`${d.date}T00:00:00`)}
                  yAccessor={yAccessor}
                />
                {secondaryData && <AnimatedLineSeries
                  dataKey="secondary-data"
                  data={secondaryData}
                  xAccessor={(d) => new Date(`${d.date}T00:00:00`)}
                  yAccessor={secondaryYAccessor}
                />}
                {graphicAnnotations}
                <Tooltip
                  snapTooltipToDatumX
                  showVerticalCrosshair
                  showSeriesGlyphs
                  verticalCrosshairStyle={{ stroke: 'var(--teal)', strokeOpacity: '1' }}
                  renderTooltip={({ tooltipData, colorScale }) => {
                    return (
                      <div className="graph-tooltip">
                        <div className="tooltip-date bold-text">{DateTime.fromISO(tooltipData.nearestDatum.datum.date).toLocaleString(DateTime.DATE_SHORT)}</div>
                        <div className="tooltip-content light-text">{`${yAccessor(tooltipData.nearestDatum.datum)} ${yLabel}`}</div>
                      </div>
                    )
                  }}
                />
              </XYChart>
            </div>}
          </div>
        </React.Fragment>}
    </div>
  );
}

// stroke={`url(#solids)`}
