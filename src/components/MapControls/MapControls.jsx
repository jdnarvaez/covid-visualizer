import React from 'react';
import { ImSpinner10 } from 'react-icons/im';
import { IoHandRight, IoHandRightOutline } from 'react-icons/io5';
import { GiResize } from 'react-icons/gi';
import { RiCursorLine, RiCursorFill, RiZoomInLine, RiZoomInFill, RiZoomOutLine, RiZoomOutFill } from 'react-icons/ri';
import { BsCursor, BsCursorFill } from 'react-icons/bs';
import { FiHelpCircle } from 'react-icons/fi';
import { TiChartLineOutline, TiChartLine } from 'react-icons/ti';
import ReactTooltip from 'react-tooltip';

import './MapControls.css';

function MapControlToggleButton({ className, style, tool, activateTool, activeTool, activeIcon, inactiveIcon, tooltipId, tooltipContent }) {
  return (
    <React.Fragment>
      <div className={`map-control-btn ${className ? className : ''}`} style={style} onClick={(e) => activateTool(tool)} data-tip data-for={tooltipId} data-tour={tooltipId}>
        {activeTool === tool ? activeIcon : inactiveIcon}
      </div>
      {tooltipId && tooltipContent && <ReactTooltip
        id={tooltipId}
        aria-haspopup='true'
        effect="solid"
        delayShow={1500}
        className="tooltip"
        clickable={true}
      >
        <div style={{ maxWidth: `${.3 * innerWidth}px`, fontSize: '13px' }}>
          {tooltipContent}
        </div>
      </ReactTooltip>}
    </React.Fragment>
  )
}

function MapControlButton({ onClick, icon, tooltipId, tooltipContent }) {
  return (
    <div className="map-control-btn" onClick={onClick} data-tip data-for={tooltipId} data-tour={tooltipId}>
      {icon}
      {tooltipId && tooltipContent && <ReactTooltip
        id={tooltipId}
        aria-haspopup='true'
        effect="solid"
        delayShow={1500}
        className="tooltip"
        clickable={true}
      >
        <div style={{ maxWidth: `${.3 * innerWidth}px`, fontSize: '13px' }}>
          {tooltipContent}
        </div>
      </ReactTooltip>}
    </div>
  )
}

export default function MapControls({ style, fitToViewer, locationLock, toggleLocationLock, activeTool, activateTool, showStats, toggleStats, setIsTourOpen, locating }) {
  return (
    <div className="map-controls overlay" data-tour="map-controls">
      <MapControlToggleButton
        tool="location-lock"
        activateTool={toggleLocationLock}
        activeTool={locationLock ? 'location-lock' : 'none'}
        activeIcon={locating ? <ImSpinner10 /> : <BsCursorFill />}
        inactiveIcon={locating ? <ImSpinner10 /> : <BsCursor />}
        className={locating ? 'spin' : ''}
        style={{ transform: locating ? undefined : 'scale(-1, 1) rotate(-24deg) translate(-2px, 1px)' }}
        tooltipId="location-lock"
        tooltipContent={<p>Tap here to find your location. When this tool is active, your location will be highlighted on the map and the county's statistics will be shown.</p>}
      />
      <MapControlToggleButton
        tool="none"
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<RiCursorFill />}
        inactiveIcon={<RiCursorLine />}
        tooltipId="none"
        tooltipContent={<p>Tap here to activate the cursor tool. When this tool is active, tapping on counties will activate them and show their statistics.</p>}
      />
      <MapControlToggleButton
        tool="pan"
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<IoHandRight />}
        inactiveIcon={<IoHandRightOutline />}
        tooltipId="pan"
        tooltipContent={<p>Tap here to activate the pan tool. When this tool is active, a tap and drag will pan the map left/right/up/down.</p>}
      />
      <MapControlToggleButton
        tool="zoom-in"
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<RiZoomInFill />}
        inactiveIcon={<RiZoomInLine />}
        tooltipId="zoom-in"
        tooltipContent={<p>Tap here to activate the zoom in tool. When this tool is active, a single tap will zoom the map out in to that position. A tap and drag action allows you to zoom into a particular selected area.</p>}
      />
      <MapControlToggleButton
        tool="zoom-out"
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<RiZoomOutFill />}
        inactiveIcon={<RiZoomOutLine />}
        tooltipId="zoom-out"
        tooltipContent={<p>Tap here to activate the zoom out tool. When this tool is active, a single tap will zoom the map out from that position.</p>}
      />
      <MapControlButton
        onClick={fitToViewer}
        icon={<GiResize />}
        tooltipId="fit-to-viewer"
        tooltipContent={<p>Tap here to fit the map to the window.</p>}
      />
      <MapControlButton
        onClick={toggleStats}
        icon={showStats ? <TiChartLine /> : <TiChartLineOutline />}
        tooltipId="toggle-stats"
        tooltipContent={<p>{`Tap here to ${showStats ? 'hide' : 'show'} the stats overlay.`}</p>}
      />
      <MapControlButton
        onClick={() => setIsTourOpen(true)}
        icon={<FiHelpCircle />}
        tooltipId="interactive-help"
        tooltipContent={<p>Tap here to view the interactive tour and information about this application.</p>}
      />
    </div>
  );
}
