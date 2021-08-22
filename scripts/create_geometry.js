import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { geoPath, geoBounds, geoAlbersUsa, geoCentroid, geoContains, geoAlbers, geoConicEqualArea } from 'd3-geo';
import topo from 'topojson-client';
const feature = topo.feature;
const path = geoPath();

const pathLengths = {
    "10": 86.01990509033203,
    "11": 12.251663208007812,
    "12": 754.3509521484375,
    "13": 375.9385681152344,
    "15": 274.67144775390625,
    "16": 550.8464965820312,
    "17": 399.6381530761719,
    "18": 322.0935363769531,
    "19": 350.31982421875,
    "20": 404.27923583984375,
    "21": 409.1167907714844,
    "22": 622.5864868164062,
    "23": 409.9902038574219,
    "24": 425.6171569824219,
    "25": 262.2811584472656,
    "26": 860.9668579101562,
    "27": 535.7445068359375,
    "28": 464.6533508300781,
    "29": 464.0402526855469,
    "30": 601.8699951171875,
    "31": 431.4661865234375,
    "32": 479.1321105957031,
    "33": 164.916015625,
    "34": 160.57501220703125,
    "35": 486.0141296386719,
    "36": 504.31353759765625,
    "37": 690.007568359375,
    "38": 361.953369140625,
    "39": 318.0241394042969,
    "40": 489.92449951171875,
    "41": 458.4875793457031,
    "42": 311.2681579589844,
    "44": 87.97248077392578,
    "45": 277.8816223144531,
    "46": 411.2425842285156,
    "47": 408.9991149902344,
    "48": 1196.9332275390625,
    "49": 402.8717346191406,
    "50": 163.86190795898438,
    "51": 560.1503295898438,
    "53": 695.8892211914062,
    "54": 350.359130859375,
    "55": 459.3045959472656,
    "56": 413.43310546875,
    "04": 474.202880859375,
    "02": 1623.8436279296875,
    "08": 428.1205749511719,
    "06": 825.7122802734375,
    "05": 409.86614990234375,
    "01": 376.2792663574219,
    "09": 110.87028503417969
}

const pathLengths = JSON.parse(readFileSync(resolve(process.cwd(), 'src', 'data', 'path_lengths.json')));
const UnitedStates = JSON.parse(readFileSync(resolve(process.cwd(), 'src', 'data', 'counties-albers-10m.json')));
const PuertoRico = JSON.parse(readFileSync(resolve(process.cwd(), 'src', 'data', 'PR-72-puerto-rico-municipios.json')));
const states_by_fips = JSON.parse(readFileSync(resolve(process.cwd(), 'src', 'data', 'states_by_fips.json')));
const counties_by_cbsa = JSON.parse(readFileSync(resolve(process.cwd(), 'src', 'data', 'counties_by_cbsa.json')));

const states = UnitedStates.objects.states.geometries.map(geometry => {
  const state = states_by_fips[geometry.id];
  const feat = feature(UnitedStates, geometry);

  return {
    fips: geometry.id,
    name: state.name,
    code: state.abbrevation,
    path: path(feat),
    length: Math.round(pathLengths[geometry.id]),
    centroid: path.centroid(feat)
  }
});

writeFileSync(resolve(process.cwd(), 'src', 'geometry', 'states.json'), JSON.stringify(states));

const shapes = UnitedStates.objects.counties.geometries.map(geometry => {
  const state_fips = geometry.id.substring(0, 2);
  const state = states_by_fips[state_fips];
  const feat = feature(UnitedStates, geometry);

  const county = {
    fips: geometry.id,
    name: geometry.properties.name,
    state: {
      fips: state_fips,
      code: state.abbreviation,
      name: state.name
    },
    path: path(feat),
    centroid: path.centroid(feat)
  }

  const cbsaCounty = counties_by_cbsa.find(c => c.fipsCountyCode === geometry.id);

  if (cbsaCounty) {
    county.cbsa = {
      fips: cbsaCounty.areaCode,
      name: cbsaCounty.areaName,
      type: cbsaCounty.areaType
    }
  }

  return county;
});

// PUERTO RICO
const epsilon = 0.000001;

function geoAlbersUsaPr() {
  var cache,
      cacheStream,
      lower48 = geoAlbers(), lower48Point,
      alaska = geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]),
      alaskaPoint,
      hawaii = geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]),
      hawaiiPoint,
      puertoRico = geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]),
      puertoRicoPoint,
      point,
      pointStream = {point: function(x, y) { point = [x, y]; }};

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    return point = null,
        (lower48Point.point(x, y), point)
        || (alaskaPoint.point(x, y), point)
        || (hawaiiPoint.point(x, y), point)
        || (puertoRicoPoint.point(x, y), point);
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : y >= 0.204 && y < 0.234 && x >= 0.320 && x < 0.380 ? puertoRico
        : lower48).invert(coordinates);
  };

  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream), puertoRico.stream(stream)]);
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_), puertoRico.precision(_);
    return reset();
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_), puertoRico.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream);

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    puertoRicoPoint = puertoRico
        .translate([x + 0.350 * k, y + 0.224 * k])
        .clipExtent([[x + 0.320 * k, y + 0.204 * k], [x + 0.380 * k, y + 0.234 * k]])
        .stream(pointStream).point;

    return reset();
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  return albersUsa.scale(1070);
}

const multiplex = (streams) => {
  const n = streams.length;
  return {
    point(x, y) { for (const s of streams) s.point(x, y); },
    sphere() { for (const s of streams) s.sphere(); },
    lineStart() { for (const s of streams) s.lineStart(); },
    lineEnd() { for (const s of streams) s.lineEnd(); },
    polygonStart() { for (const s of streams) s.polygonStart(); },
    polygonEnd() { for (const s of streams) s.polygonEnd(); }
  };
}

// This creates a PR object in the albers projection between texas and florida
const puertoRicoProjection = geoAlbersUsaPr().scale(4000).translate([-725, -300]);
const puertoRicoPath = geoPath(puertoRicoProjection);

const municipios = PuertoRico.objects.cb_2015_puerto_rico_county_20m.geometries.map(geometry => {
  const feat = feature(PuertoRico, geometry);

  return {
    fips: geometry.properties.GEOID,
    name: geometry.properties.NAME,
    state: {
      fips: geometry.properties.STATEFP,
      code: 'PR',
    },
    path: puertoRicoPath(feat),
    centroid: puertoRicoPath.centroid(feat)
  }
});

// writeFileSync(resolve(process.cwd(), 'src', 'geometry', 'counties.json'), JSON.stringify(shapes.concat(municipios)));
