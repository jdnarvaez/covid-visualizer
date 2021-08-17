const path = require('path');
const fs = require('fs');
const request = require('request-promise');
const { flatten, uniq } = require('lodash');
const accounts = require('../src/accounts.json');
const { geoPath, geoBounds, geoAlbersUsa, geoCentroid, geoContains } = require('d3-geo');
const { feature, mesh, bbox } = require('topojson-client');
const apiKeys = [];

const contains = require('@turf/boolean-contains').default;
const intersect = require('@turf/intersect').default;
const pointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { getGeom, getCoords } = require('@turf/invariant');

console.log(intersect);
console.log(require('@turf/invariant'))


let UnitedStates = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'counties-10m.json')));
let CBSA_DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'cbsa.tiger2013.json')));
let stateCodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'processed', 'state-codes.json')));
let countiesSummary = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'counties-summary.json')));

countiesSummary.forEach(summary => summary.county = summary.county.replace('County', '').trim())

class Rect {
  constructor(bounds) {
    this.x0 = bounds[0][0];
    this.y0 = bounds[0][1];
    this.x1 = bounds[1][0];
    this.y1 = bounds[1][1];
  }

  contains = (rect) => {
    return
      this.containsPoint(rect.x0, rect.y0) &&
      this.containsPoint(rect.x1, rect.y0) &&
      this.containsPoint(rect.x0, rect.y1) &&
      this.containsPoint(rect.x1, rect.y1);
  }

  containsPoint = (x, y) => {
    return x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1;
  }
}

function makeFeature(topology, feat) {
  const f = feature(topology, feat);
  f.properties.bounds = new Rect(geoBounds(f));
  f.properties.centroid = geoCentroid(f);

  if (f.properties.name) {
    f.properties.name = f.properties.name.replace('County', '').trim();
  }

  return f;
}

const states = UnitedStates.objects.states.geometries.map(g => makeFeature(UnitedStates, g));
const counties = UnitedStates.objects.counties.geometries.map(g => makeFeature(UnitedStates, g));

// const cbsas = CBSA_DATA.features.map(g => {
//   g.properties.bounds = new Rect(geoBounds(g));
//   return g;
// });

UnitedStates.objects.states.geometries.forEach(geometry => geometry.properties.stateCode = stateCodes[geometry.properties.name]);

counties.forEach(county => {
  const possibleStates = states.filter(s => s.properties.bounds.containsPoint(county.properties.centroid[0], county.properties.centroid[1]));
  const possibleCBSAs = CBSA_DATA.features.filter(f => geoContains(f, county.properties.centroid));

  if (possibleCBSAs.length > 1) {
    console.log('ambiguous cbsa');
    console.log(possibleCBSAs)
    process.exit(0);
  } else if (possibleCBSAs.length === 0) {
    console.log('unable to determine cbsa')
  } else {
    const { CSAFP, CBSAFP, GEOID, NAME, NAMELSAD, MTFCC } = possibleCBSAs[0].properties;

    county.properties.cbsa = {
      CSAFP, CBSAFP, GEOID, NAME, NAMELSAD, MTFCC
    }
  }

  const possibleSummaries = possibleStates.map(state => {
    return countiesSummary.filter(summary => summary.state === state.properties.stateCode && summary.county === county.properties.name);
  }).flat();

  if (possibleSummaries.length > 1) {
    const geom = getGeom(county);
    const coordinates = geom.type === 'Polygon' ? geom.coordinates.flat() : geom.coordinates.flat().flat();

    const states = possibleStates.filter(s => {
      const poly = getGeom(s);
      return coordinates.filter(coord => { return !pointInPolygon(coord, poly) }).length === 0;
    });

    if (states.length > 1) {
      console.log('ambiguous')
      console.log(county.properties.name);
      console.log(possibleStates)
      console.log(possibleSummaries)
      process.exit(0)
    } else if (states.length === 0) {
      console.log('unable to determine state')
      console.log(county.properties.name);
      console.log(possibleStates)
      console.log(possibleSummaries)
    } else {
      county.properties.state = states[0].properties.stateCode;
      const summaries = countiesSummary.filter(summary => summary.state === county.properties.state && summary.county === county.properties.name);

      if (summaries.length > 1) {
        console.log('ambiguous after filter')
        console.log(summaries);
        process.exit(0)
      } else if (summaries.length === 0) {
        console.log('no data found')
      } else {
        county.properties.fips = summaries[0].fips;
        county.properties.locationId = summaries[0].locationId;
      }
    }
  } else if (possibleSummaries.length === 0) {
    console.log('no summary found')
    console.log(county.properties.name);
  } else {
    county.properties.state = possibleSummaries[0].state;
    county.properties.fips = possibleSummaries[0].fips;
    county.properties.locationId = possibleSummaries[0].locationId;
  }
})

fs.writeFileSync(path.resolve(__dirname, '..', 'src', 'data', 'processed', 'counties-10m.json'), JSON.stringify(UnitedStates));
