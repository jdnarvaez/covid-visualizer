import React, { useEffect, useState, useRef } from 'react';
import { AiFillWarning, AiOutlineWarning } from 'react-icons/ai';
import { ImSpinner10 } from 'react-icons/im';
import { IoHandRight, IoHandRightOutline, IoLayers, IoSkullOutline, IoSkull, IoCubeOutline, IoCube, IoStatsChartOutline, IoStatsChart } from 'react-icons/io5';
import { FaBiohazard } from 'react-icons/fa';
import { GiResize, GiDeathSkull, GiBiohazard } from 'react-icons/gi';

import {
  RiCursorLine, RiCursorFill, RiZoomInLine, RiZoomInFill, RiZoomOutLine, RiZoomOutFill, RiMessage2Fill, RiMessage2Line, RiAlarmWarningLine, RiAlarmWarningFill ,
  RiSyringeFill,
  RiSyringeLine,
  RiPercentLine, RiPercentFill,
  RiExchangeLine, RiExchangeFill
} from 'react-icons/ri';

import { BsCursor, BsCursorFill } from 'react-icons/bs';
import { FiHelpCircle } from 'react-icons/fi';
import { TiChartLineOutline, TiChartLine } from 'react-icons/ti';
import ReactTooltip from 'react-tooltip';

import './MapControls.css';

const MapControlDropdownButton = ({ onClick, icon, tooltipId, tooltipContent, isTouchDevice, children, dataTour, tooltipPlace, setHighlightedState }) => {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (isMouseOver) {
      setHighlightedState(null);
    }
  }, [isMouseOver])

  return (
    <div className="map-control-btn map-control-dropdown-btn" data-tip data-for={tooltipId} data-tour={tooltipId || dataTour} onClick={() => setIsMouseOver(!isMouseOver)} onMouseEnter={() => setIsMouseOver(true)} onMouseOver={() => setIsMouseOver(true)} onMouseLeave={() => setIsMouseOver(false)} ref={ref}>
      {icon}
      {!isTouchDevice && tooltipId && tooltipContent && <ReactTooltip
        id={tooltipId}
        aria-haspopup='true'
        effect="solid"
        delayShow={1500}
        className="tooltip"
        clickable={true}
        place={tooltipPlace}
      >
        <div style={{ maxWidth: `${.3 * innerWidth}px`, fontSize: '13px' }}>
          {tooltipContent}
        </div>
      </ReactTooltip>}
      <div className={`map-control-dropdown ${isMouseOver ? 'show' : 'hide'}`} data-tour="map-layers-dropdown">
        <div className="map-control-drop-down-container overlay">
          {(Array.isArray(children) ? children : [children]).map(child => <div>{child}</div>)}
        </div>
      </div>
    </div>
  )
}

const MapControlLayerButton = ({ className, style, tool, activateTool, activeTool, activeIcon, inactiveIcon, tooltipId, tooltipContent, isTouchDevice, tooltipPlace, layerName }) => {
  const toolId = tool || tooltipId;

  const onClick = (e) => {
    e.stopPropagation();
    activateTool(toolId);
  }

  return (
    <React.Fragment>
      <div className={`map-control-btn map-control-layer-btn ${className ? className : ''}`} style={style} onClick={onClick} data-tip data-for={tooltipId} data-tour={tooltipId}>
        <div className="layer-icon">{activeTool === toolId ? activeIcon : inactiveIcon}</div>
        <div className="layer-name">{layerName}</div>
      </div>
      {!isTouchDevice && tooltipId && tooltipContent && <ReactTooltip
        id={tooltipId}
        aria-haspopup='true'
        effect="solid"
        delayShow={1500}
        className="tooltip"
        clickable={true}
        place={tooltipPlace}
      >
        <div style={{ maxWidth: `${.3 * innerWidth}px`, fontSize: '13px' }}>
          {tooltipContent}
        </div>
      </ReactTooltip>}
    </React.Fragment>
  )
}

const MapControlToggleButton = ({ className, style, tool, activateTool, activeTool, activeIcon, inactiveIcon, tooltipId, tooltipContent, isTouchDevice, tooltipPlace }) => {
  const toolId = tool || tooltipId;

  return (
    <React.Fragment>
      <div className={`map-control-btn ${className ? className : ''}`} style={style} onClick={(e) => activateTool(toolId)} data-tip data-for={tooltipId} data-tour={tooltipId}>
        {activeTool === toolId ? activeIcon : inactiveIcon}
      </div>
      {!isTouchDevice && tooltipId && tooltipContent && <ReactTooltip
        id={tooltipId}
        aria-haspopup='true'
        effect="solid"
        delayShow={1500}
        className="tooltip"
        clickable={true}
        place={tooltipPlace}
      >
        <div style={{ maxWidth: `${.3 * innerWidth}px`, fontSize: '13px' }}>
          {tooltipContent}
        </div>
      </ReactTooltip>}
    </React.Fragment>
  )
}

const MapControlButton = ({ onClick, icon, tooltipId, tooltipContent, isTouchDevice, tooltipPlace }) => {
  return (
    <div className="map-control-btn" onClick={onClick} data-tip data-for={tooltipId} data-tour={tooltipId}>
      {icon}
      {!isTouchDevice && tooltipId && tooltipContent && <ReactTooltip
        id={tooltipId}
        aria-haspopup='true'
        effect="solid"
        delayShow={1500}
        className="tooltip"
        clickable={true}
        place={tooltipPlace}
      >
        <div style={{ maxWidth: `${.3 * innerWidth}px`, fontSize: '13px' }}>
          {tooltipContent}
        </div>
      </ReactTooltip>}
    </div>
  )
}

export default function MapControls({ style, fitToViewer, locationLock, toggleLocationLock, activeTool, activateTool, showStats, toggleStats, setIsTourOpen, locating, isTouchDevice, toggleTooltips, showTooltips, mapLayer, setMapLayer, setHighlightedState }) {
  return (
    <div className="map-controls overlay" data-tour="map-controls">
      <MapControlToggleButton
        tool="location-lock"
        isTouchDevice={isTouchDevice}
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
        isTouchDevice={isTouchDevice}
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<RiCursorFill />}
        inactiveIcon={<RiCursorLine />}
        tooltipId="none"
        tooltipContent={<p>Tap here to activate the cursor tool. When this tool is active, tapping on counties will activate them and show their statistics.</p>}
      />
      <MapControlToggleButton
        tool="pan"
        isTouchDevice={isTouchDevice}
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<IoHandRight />}
        inactiveIcon={<IoHandRightOutline />}
        tooltipId="pan"
        tooltipContent={<p>Tap here to activate the pan tool. When this tool is active, a tap and drag will pan the map left/right/up/down.</p>}
      />
      <MapControlToggleButton
        tool="zoom-in"
        isTouchDevice={isTouchDevice}
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<RiZoomInFill />}
        inactiveIcon={<RiZoomInLine />}
        tooltipId="zoom-in"
        tooltipContent={<p>Tap here to activate the zoom in tool. When this tool is active, a single tap will zoom the map out in to that position. A tap and drag action allows you to zoom into a particular selected area.</p>}
      />
      <MapControlToggleButton
        tool="zoom-out"
        isTouchDevice={isTouchDevice}
        activateTool={activateTool}
        activeTool={activeTool}
        activeIcon={<RiZoomOutFill />}
        inactiveIcon={<RiZoomOutLine />}
        tooltipId="zoom-out"
        tooltipContent={<p>Tap here to activate the zoom out tool. When this tool is active, a single tap will zoom the map out from that position.</p>}
      />
      <MapControlButton
        isTouchDevice={isTouchDevice}
        onClick={fitToViewer}
        icon={<GiResize />}
        tooltipId="fit-to-viewer"
        tooltipContent={<p>Tap here to fit the map to the window.</p>}
      />
      <MapControlButton
        isTouchDevice={isTouchDevice}
        onClick={toggleStats}
        icon={showStats ? <TiChartLine /> : <TiChartLineOutline />}
        tooltipId="toggle-stats"
        tooltipContent={<p>{`Tap here to ${showStats ? 'hide' : 'show'} the stats overlay.`}</p>}
      />
      <MapControlButton
        isTouchDevice={isTouchDevice}
        onClick={toggleTooltips}
        icon={showTooltips ? <RiMessage2Fill /> : <RiMessage2Line />}
        tooltipId="toggle-tooltips"
        tooltipContent={<p>{`Tap here to ${showTooltips ? 'hide' : 'show'} tooltips for each state.`}</p>}
      />
      <MapControlDropdownButton
        isTouchDevice={isTouchDevice}
        setHighlightedState={setHighlightedState}
        icon={<IoLayers />}
        dataTour="map-layers"
      >
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<RiAlarmWarningFill />}
          inactiveIcon={<RiAlarmWarningLine />}
          layerName={`Overall Risk Level`}
          tooltipId="risk"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<RiExchangeFill />}
          inactiveIcon={<RiExchangeLine />}
          layerName={`CDC Transmission Level`}
          tooltipId="cdc"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<IoStatsChart />}
          inactiveIcon={<IoStatsChartOutline />}
          layerName={`Case Fatality Rate`}
          tooltipId="cfr"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<IoSkull />}
          inactiveIcon={<IoSkullOutline />}
          layerName={`Total Deaths`}
          tooltipId="deaths"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<RiSyringeFill />}
          inactiveIcon={<RiSyringeLine />}
          layerName={`Vaccinated`}
          tooltipId="vaccinated"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<AiFillWarning />}
          inactiveIcon={<AiOutlineWarning />}
          layerName={`Cases`}
          tooltipId="cases"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<IoCube />}
          inactiveIcon={<IoCubeOutline />}
          layerName={`Case Density`}
          tooltipId="caseDensity"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<FaBiohazard />}
          inactiveIcon={<GiBiohazard />}
          layerName={`Infection Rate`}
          tooltipId="infectionRate"
        />
        <MapControlLayerButton
          isTouchDevice={isTouchDevice}
          activateTool={setMapLayer}
          activeTool={mapLayer}
          activeIcon={<RiPercentFill />}
          inactiveIcon={<RiPercentLine />}
          layerName={`Test Positivity`}
          tooltipId="testPositivityRatio"
        />
      </MapControlDropdownButton>
      <MapControlButton
        isTouchDevice={isTouchDevice}
        onClick={() => setIsTourOpen(true)}
        icon={<FiHelpCircle />}
        tooltipId="interactive-help"
        tooltipContent={<p>Tap here to view the interactive tour and information about this application.</p>}
      />
    </div>
  );
}
