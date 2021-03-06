import { scaleQuantize, scaleLinear, scaleQuantile, scaleSequential } from 'd3-scale';

import {
  interpolateInferno,
  interpolateMagma,
  interpolateWarm,
  interpolateOrRd,
  interpolateGreens,
  interpolateYlOrRd,
  interpolateRdYlGn,
  interpolatePuRd,
  interpolateRdPu,
  interpolateYlOrBr,
  interpolateOranges
} from 'd3-scale-chromatic';

import shapes from '../../../geometry/counties.json';
import oboe from '../../../oboe';

const filterOutliers = (values) => {
  if(values.length < 4)
    return values;

  let q1, q3, iqr, maxValue, minValue;

  values = values.sort( (a, b) => a - b);

  // find quartiles
  if ((values.length / 4) % 1 === 0) {
    q1 = 1/2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
    q3 = 1/2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)];
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
  }

  iqr = q3 - q1;
  maxValue = q3 + iqr * 1.5;
  minValue = q1 - iqr * 1.5;

  return values.filter((x) => (x >= minValue) && (x <= maxValue));
}

const throttle = (fn, threshhold, scope) => {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

const counties = [];
const toProcess = {};
const summaries = {};
let doneCount = 0;

const sendMessage = throttle(() => {
  self.postMessage(counties);

  if (counties.length === 3220 && Object.keys(summaries).length === 0) {
    if (doneCount) {
      counties.length = 0;
    } else {
      doneCount++;
    }
  }
}, 60);

const overallRiskColorScale = scaleQuantile().domain([1, 2, 3, 4, 5]).range(['var(--low)', 'var(--medium)', 'var(--high)', 'var(--very-high)', 'var(--severe)']);
const cdcRiskColorScale = scaleQuantile().domain([0, 1, 2, 3, 4]).range(['var(--low)', 'var(--medium)', 'var(--high)', 'var(--very-high)', 'transparent']);
const hospitalCapScale = scaleSequential(interpolateRdPu);
const icuCapScale = scaleSequential(interpolateOranges);

const setFillColors = (county, summary) => {
  county.fill = {
    riskLevels: {
      overall: overallRiskColorScale(summary.riskLevels.overall),
    },
    cdc: cdcRiskColorScale(summary.cdcTransmissionLevel)
  }

  if (summary.actuals.hospitalBeds && summary.actuals.hospitalBeds.capacity !== null && summary.actuals.hospitalBeds.currentUsageTotal !== null) {
    county.fill.hospitalCap = hospitalCapScale(summary.actuals.hospitalBeds.currentUsageTotal / summary.actuals.hospitalBeds.capacity);
  }

  if (summary.actuals.icuBeds && summary.actuals.icuBeds.capacity !== null && summary.actuals.icuBeds.currentUsageTotal !== null) {
    county.fill.icuCap = icuCapScale(summary.actuals.icuBeds.currentUsageTotal / summary.actuals.icuBeds.capacity);
  }
}

const addCounty = (county, summary) => {
  setFillColors(county, summary);
  counties.push(county);
  sendMessage();
}

const fetchData = (apiKey) => {
  oboe(`https://api.covidactnow.org/v2/counties.json?apiKey=${apiKey}`)
  .node('{fips actuals metrics riskLevels}', (node, nodePath, ancestors) => {
    // filter out Saipan & Tinian
    if (node.fips.indexOf('69') === 0) {
      return;
    }

    summaries[node.fips] = node;

    const county = toProcess[node.fips];
    delete toProcess[node.fips];

    if (county) {
      addCounty(county, node);
    } else {
      toProcess[node.fips] = node;
    }
  })
  .on('done', function(json) {
    this.forget();

    const deaths = filterOutliers(json.map(s => s.actuals.deaths).filter(s => !!s && !isNaN(s)));
    const maxDeaths = Math.max(...deaths);

    const caseDensities = filterOutliers(json.map(s => s.metrics.caseDensity).filter(s => !!s && !isNaN(s)));
    const maxCaseDensity = Math.max(...caseDensities);

    const infectionRates = json.map(s => s.metrics.infectionRate).filter(s => !!s && !isNaN(s));
    const maxInfectionRate = Math.max(...infectionRates);

    const cases = filterOutliers(json.map(s => s.actuals.cases / s.population).filter(s => !!s && !isNaN(s)));
    const maxCases = Math.max(...cases);

    const cfrs = filterOutliers(json.map(s => s.actuals.deaths / s.actuals.cases).filter(s => !!s && !isNaN(s)));
    const maxCFR = Math.max(...cfrs);

    const vaxPct = json.map(s => s.actuals.vaccinationsCompleted / s.population).filter(s => !!s && !isNaN(s));
    const maxVaxPct = Math.max(...vaxPct);

    const testPositivityRatios = json.map(s => s.metrics.testPositivityRatio).filter(s => !!s && !isNaN(s));
    const maxTestPositivityRatio = Math.max(...testPositivityRatios);

    const cfrScale = scaleSequential(interpolateWarm);
    const deathScale = scaleSequential(interpolateOrRd);
    const vaccinatedScale = scaleSequential(interpolateGreens);
    const casesScale = scaleSequential(interpolatePuRd);
    const caseDensityScale = scaleSequential(interpolateYlOrRd);
    const testPositivityRatioScale = scaleSequential(interpolateInferno);
    const infectionRateScale = scaleSequential(interpolateRdYlGn);

    const computeStats = (county) => {
      const stats = json.find(s => s.fips === county.fips);
      delete summaries[county.fips];
      const cfr = !!stats.actuals.deaths && !!stats.actuals.cases ? stats.actuals.deaths / stats.actuals.cases : undefined;
      const vaxPct = !!stats.actuals.vaccinationsCompleted ? stats.actuals.vaccinationsCompleted / stats.population : undefined;

      if (!county.fill) {
        setFillColors(county, stats);
      }

      county.fill.cfr = !!stats.actuals.deaths ? cfrScale(1 - (cfr / maxCFR)) : 'transparent';
      county.fill.deaths = !!stats.actuals.deaths ? deathScale(stats.actuals.deaths / maxDeaths) : 'transparent';
      county.fill.vaccinated = !!vaxPct ? vaccinatedScale(vaxPct / maxVaxPct) : 'transparent';
      county.fill.cases = !!stats.actuals.cases ? casesScale((stats.actuals.cases / stats.population) / maxCases) : 'transparent';
      county.fill.caseDensity = !!stats.metrics.caseDensity ? caseDensityScale(stats.metrics.caseDensity / maxCaseDensity) : 'transparent';
      county.fill.infectionRate = !!stats.metrics.infectionRate  ? infectionRateScale(1 - (stats.metrics.infectionRate / maxInfectionRate)) : 'transparent';
      county.fill.testPositivityRatio = !!stats.metrics.testPositivityRatio ? testPositivityRatioScale(1 - (stats.metrics.testPositivityRatio / maxTestPositivityRatio)) : 'transparent';
    }

    counties.forEach(computeStats);
    Object.keys(toProcess).forEach(key => computeStats(toProcess[key]))
    sendMessage()
  });

  oboe(shapes)
  .node('{path}', (node, nodePath, ancestors) => {
    const summary = toProcess[node.fips];
    delete toProcess[node.fips];

    if (summary) {
      addCounty(node, summary);
    } else {
      toProcess[node.fips] = node;
    }
  })
  .on('done', function(json) {
    this.forget();
    sendMessage();
  });
}

self.onmessage = (e) => {
  fetchData(e.data)
};
