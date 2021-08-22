import url from '../../../geometry/nation.json';

self.onmessage = (e) => {
  fetch(url)
  .then(response => response.json())
  .then(json => self.postMessage(json.path))
};
