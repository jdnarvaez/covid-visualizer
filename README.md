# covid-visualizer
Interactive Maps &amp; Graphs of Realtime COVID Data


<img width="2048" alt="Screen Shot 2021-08-17 at 12 09 30 AM" src="https://user-images.githubusercontent.com/3358381/129725384-e47fc788-389c-4481-bb57-60879960649c.png">

# Data
Data is sourced from [COVID ActNow](https://covidactnow.org/) which aggregates data from a variety of sources.

[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) are used to cache data from different APIs and are considered valid for up to 24 hours. By caching the data, we eliminate the need to continually hit the API servers and eliminate the need to keep large responses in memory. 

[Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) are used to load topography in the background and compute relative statistics for regions.

# Releases
## 0.0.3
Use web workers to load topography

## 0.0.2
State summaries on mouse over

## 0.0.1
Initial release

# Made With
* [d3](https://d3js.org)
* [Framer Motion](https://www.framer.com/motion/)
* [React](https://reactjs.org)
* [Preact](https://preactjs.com)
* [visx](https://airbnb.io/visx/)
* [COVID ActNow](https://covidactnow.org/)
* [React Icons](https://react-icons.github.io/react-icons/)
* [Oboe](http://oboejs.com)
* [Luxon](https://moment.github.io/luxon/#/)


