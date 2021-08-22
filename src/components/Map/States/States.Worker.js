import url from '../../../geometry/states.json';
import oboe from '../../../oboe';

const states = [];

self.onmessage = (e) => {
  oboe(url)
  .node('{fips}', (node, nodePath, ancestors) => {
    states.push(node);
    self.postMessage(states);
  })
  .on('done', function(json) {
    this.forget();
    states.length = 0;
  });
};
