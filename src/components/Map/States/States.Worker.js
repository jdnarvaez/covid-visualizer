import url from '../../../geometry/states.json';
import oboe from '../../../oboe';

let parser;
const states = [];

self.onmessage = (e) => {
  if (parser) {
    parser.abort();
  }

  states.length = 0;

  oboe(url)
  .node('{fips}', (node, nodePath, ancestors) => {
    states.push(node);
    self.postMessage(states);
  })
  .on('start', function() {
    parser = this;
  })
  .on('done', function(json) {
    this.forget();
    parser = null;
  });
};
