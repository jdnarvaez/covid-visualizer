import React from 'react';

import './TourSteps.css';

function TourStep({ title, subtitle, content, shortcut, actionCaption, onAction }) {
  return (
    <div className="tour-step">
      <div className="title">{title}</div>
      {subtitle && <div className="subtitle shortcut">{subtitle}</div>}
      {shortcut && <div className="shortcut">{`press the '${shortcut}' key to toggle this feature`}</div>}
      <div className="content">{content}</div>
      {actionCaption && onAction && <div className="action" onClick={onAction}>{actionCaption}</div>}
    </div>
  )
}

export const TourSteps = ({ viewer, showIntro, currentLocation, findLocation, activeCounty, showStats, toggleStats, showTooltips, toggleTooltips }) => {
  return [showIntro ? {
      content: ({ goTo, step }) =>
        <TourStep
          title="Welcome"
          subtitle="COVID-19 Insights & Visualizations"
          content="This application provides up-to-date statistics regarding the spread of COVID-19 throughout the United Stats and the metro areas and counties within it."
          onAction={() => { goTo(step + 1) } }
          actionCaption="Take a guided tour!"
        />
    } : undefined,
    {
      selector: '[data-tour="map-controls"]',
      content:
      <TourStep
        title="Map Controls"
        content="These are the main application controls. They allow you to switch interaction modes and change map views."
      />
    },
    {
      selector: '[data-tour="location-lock"]',
      content:
      <TourStep
        title="Location Lock"
        shortcut={1}
        content="Detect your current location and select the enclosing county if applicable."
        onAction={findLocation}
        actionCaption={'Find my Location'}
      />
    },
    currentLocation ?
    {
      selector: '[data-tour="current-location"]',
      action: () => {
        viewer.current.fitSelection(currentLocation.x - 25, currentLocation.y - 25, 75, 75);

        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        })
      },
      content:
      <TourStep
        title="Current Location"
        content="This pulsating circle shows your detected location."
      />
    } : undefined,
    activeCounty ?
    {
      selector: '[data-tour="county-highlight"]',
      content:
      <TourStep
        title="Selected County"
        content="The currently selected county is shown in white."
      />
    } : undefined,
    {
      selector: '[data-tour="none"]',
      content:
      <TourStep
        title="Cursor"
        shortcut={2}
        content="The cursor tool allows you to select counties and view their associated stats."
      />
    },
    {
      selector: '[data-tour="pan"]',
      content:
      <TourStep
        title="Pan"
        shortcut={3}
        content="The pan tool allows you to move the map view up/down/left/right."
      />
    },
    {
      selector: '[data-tour="zoom-in"]',
      content:
      <TourStep
        title="Zoom In"
        shortcut={4}
        content="The zoom in tool allows you to zoom into specific locations on the map by either tapping on the map or performing a tap-and-drag to select a specific location of interest."
      />
    },
    {
      selector: '[data-tour="zoom-out"]',
      content:
      <TourStep
        title="Zoom Out"
        shortcut={5}
        content="The zoom out tool allows you to zoom out of specific locations on the map by tapping on the map."
      />
    },
    {
      selector: '[data-tour="fit-to-viewer"]',
      content:
      <TourStep
        title="Fit to Screen"
        shortcut={6}
        content="Fit the entire map inside of the current window."
      />
    },
    activeCounty ? {
      selector: '[data-tour="toggle-stats"]',
      action: () => {
        if (!showStats) {
          toggleStats();
        }
      },
      content:
      <TourStep
        title="Toggle Stats"
        shortcut={7}
        content="Hide or show the statistics overlay."
      />
    } : undefined,
    {
      selector: '[data-tour="toggle-tooltips"]',
      action: () => {
        if (!showTooltips) {
          toggleTooltips();
        }
      },
      content:
      <TourStep
        title="Toggle Tooltips"
        shortcut={8}
        content="Hide or show the dynamic tooltips for states when hovered over."
      />
    },
    {
      selector: '[data-tour="map-layers"]',
      content:
      <TourStep
        title="Choose Map Layer"
        content="Change which fill layer is shown on the map."
      />
    },
    {
      selector: '[data-tour="map-layers-dropdown"]',
      action: () => {
        const node = document.querySelector('.map-control-dropdown');

        if (!node.classList.contains('show')) {
          node.classList.add('show');
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 500)

        }
      },
      content:
      <TourStep
        title="Map Layers"
        content="These options toggle which heat map layer is shown."
      />
    },
    {
      selector: '[data-tour="map-legend"]',
      content:
      <TourStep
        title="Heat Map Legend"
        content="This gradient corresponds to the heat map fill of the counties. The color at the top of the gradient is highest risk and the color at the bottom is the lowest."
      />
    },
    activeCounty ? {
      selector: '[data-tour="location-information"]',
      content:
      <TourStep
        title="Location Information"
        content="This shows a summary of the selected county/region/state"
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="risk-scale"]',
      content:
      <TourStep
        title="Risk Scale"
        content="The risk scale is based on COVID ActNow's classification of the active county/region/state. More information can be found on their site."
        onAction={() => { window.open('https://covidactnow.org', '_newtab') }}
        actionCaption={'Visit the COVID ActNow website'}
      />
    } : undefined,
    activeCounty && activeCounty.cbsa ? {
      selector: '[data-tour="cbsa-info"]',
      content:
      <TourStep
        title="Region (CBSA)"
        content="If the selected county is within a greater metro area (CBSA), it will be displayed here."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="county-info"]',
      content:
      <TourStep
        title="County"
        content="The name of the currently selected county"
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="last-updated"]',
      content:
      <TourStep
        title="Last Updated"
        content="This shows the last time that data was refreshed. COVID ActNow publishes daily updates at 12pm EST and this application will attempt to cache data for 24 hours once it is refreshed."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="toggle-maximise"]',
      content:
      <TourStep
        title="Maximize/Minimize"
        content="Toggle the size of the stats overlay to either take up the entire screen or just a portion of it."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="resize-handle"]',
      content:
      <TourStep
        title="Resize Handle"
        content="You can tap and drag on this edge to make the stats overlay larger or smaller."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="metric-level"]',
      content:
      <TourStep
        title="Metric Level of Granularity"
        content="Stats and graphs can be shown at the Country, State, Region, and County level. You can switch between these levels by tapping these indicators. The application defaults to the County level if no other level has been chosen before."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="daily-stats"]',
      content:
      <TourStep
        title="Daily Stats"
        content="These show the daily new cases or deaths based on the selected region."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="example-metric"]',
      content:
      <TourStep
        title="Changing Metric Data"
        content="Tapping on the icon for a metric will change the data shown in the graph below."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="general-metrics"]',
      content:
      <TourStep
        title="Metrics"
        content="These show general metrics about the selected region. The color of the icon corresponds to the COVID ActNow/CDC 'risk level' of the selected area for that particular metric."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="hospital-metrics"]',
      content:
      <TourStep
        title="Hospital Stats"
        content="These show the number of currently occupied hospital beds and ICU beds for the selected region. If available, current usage, typical usage, and usage dedicated to COVID patients are shown."
      />
    } : undefined,
    activeCounty ? {
      selector: '[data-tour="graphs"]',
      content:
      <TourStep
        title="Graphs"
        content="This will show how the currently selected metric for a region has changed over time. If additional information about mandates/ordinances in the region is available, they will be shown as annoations here."
      />
    } : undefined
  ].filter(step => !!step);
}
