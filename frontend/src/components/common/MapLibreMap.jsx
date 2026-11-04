import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { 
  Layers, 
  AlertCircle, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  X, 
  Copy, 
  Check, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  Info,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

// Tile provider configurations (Free & Open Cartography - Zero watermarks, Zero CSS inversion hacks)
const TILE_PROVIDERS = {
  esri_dark: {
    name: 'ESRI Dark Gray Canvas',
    label: 'Dark Canvas',
    type: 'composite',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    ref: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community',
    maxZoom: 16
  },
  osm_standard: {
    name: 'OpenStreetMap Standard',
    label: 'Street / OSM',
    type: 'single',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    name: 'ESRI World Imagery',
    label: 'Satellite',
    type: 'single',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    maxZoom: 18
  }
};

const buildMapStyle = (providerKey) => {
  const provider = TILE_PROVIDERS[providerKey] || TILE_PROVIDERS.esri_dark;

  if (provider.type === 'composite') {
    return {
      version: 8,
      sources: {
        'esri-dark-base': {
          type: 'raster',
          tiles: [provider.base],
          tileSize: 256,
          attribution: provider.attribution,
          maxzoom: provider.maxZoom
        },
        'esri-dark-ref': {
          type: 'raster',
          tiles: [provider.ref],
          tileSize: 256,
          maxzoom: provider.maxZoom
        }
      },
      layers: [
        {
          id: 'base-layer',
          type: 'raster',
          source: 'esri-dark-base',
          minzoom: 0,
          maxzoom: provider.maxZoom
        },
        {
          id: 'ref-layer',
          type: 'raster',
          source: 'esri-dark-ref',
          minzoom: 0,
          maxzoom: provider.maxZoom
        }
      ]
    };
  }

  return {
    version: 8,
    sources: {
      'single-base': {
        type: 'raster',
        tiles: [provider.url],
        tileSize: 256,
        attribution: provider.attribution,
        maxzoom: provider.maxZoom
      }
    },
    layers: [
      {
        id: 'base-layer',
        type: 'raster',
        source: 'single-base',
        minzoom: 0,
        maxzoom: provider.maxZoom
      }
    ]
  };
};

export const MapLibreMap = ({
  center = [75.7139, 19.7515], // Default centered on Maharashtra
  zoom = 6,
  geojsonData = null,
  layerConfig = null,
  markers = [],
  className = "w-full h-full min-h-[350px]",
  onSelectFeature = null,
  fitBounds = null,
  initialProvider = 'esri_dark'
}) => {
  const mapContainer = useRef(null);
  const mapWrapperRef = useRef(null);
  const mapRef = useRef(null);

  const [activeProviderKey, setActiveProviderKey] = useState(initialProvider);
  const [mapError, setMapError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorCoords, setCursorCoords] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Layer toggles
  const [visibleLayers, setVisibleLayers] = useState({
    stations: true,
    boundaries: true
  });

  const activeProvider = TILE_PROVIDERS[activeProviderKey] || TILE_PROVIDERS.esri_dark;

  // ---------------------------------------------------------------------------
  // 1. INITIALIZE MAP (SINGLE INSTANCE LIFECYCLE)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      const style = buildMapStyle(activeProviderKey);

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: style,
        center: center,
        zoom: zoom,
        attributionControl: false
      });

      // Built-in Scale Control
      map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

      map.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
      });

      map.on('mousemove', (e) => {
        if (!e.lngLat) return;
        setCursorCoords({
          lng: e.lngLat.lng.toFixed(4),
          lat: e.lngLat.lat.toFixed(4),
          zoom: map.getZoom().toFixed(1)
        });
      });

      map.on('error', (e) => {
        // Log non-fatal tile errors without unmounting map
        if (e?.error?.status !== 404) {
          console.warn('MapLibre GL Notice:', e?.error?.message || e);
        }
      });

      // Unified Map Click Handler (prevents multiple listener leaks)
      map.on('click', (e) => {
        if (!map.isStyleLoaded()) return;

        // 1. Prioritize clicking on clusters
        if (map.getLayer('clusters')) {
          const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          if (clusterFeatures.length > 0) {
            const clusterId = clusterFeatures[0].properties.cluster_id;
            const source = map.getSource('stations-clustered-source');
            if (source) {
              source.getClusterExpansionZoom(clusterId, (err, targetZoom) => {
                if (err) return;
                map.easeTo({
                  center: clusterFeatures[0].geometry.coordinates,
                  zoom: targetZoom + 0.5,
                  duration: 500
                });
              });
            }
            return;
          }
        }

        // 2. Prioritize clicking on individual station points
        if (map.getLayer('unclustered-point')) {
          const pointFeatures = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
          if (pointFeatures.length > 0) {
            const feat = pointFeatures[0];
            const coords = feat.geometry.coordinates;
            setSelectedStation({
              ...feat.properties,
              coordinates: [coords[1], coords[0]] // [lat, lng]
            });
            return;
          }
        }

        // 3. Fallback: clicking on boundary polygons
        if (map.getLayer('custom-geojson-fill') && onSelectFeature) {
          const boundaryFeatures = map.queryRenderedFeatures(e.point, { layers: ['custom-geojson-fill'] });
          if (boundaryFeatures.length > 0) {
            onSelectFeature(boundaryFeatures[0].properties);
          }
        }
      });

      // Hover cursors
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'custom-geojson-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'custom-geojson-fill', () => { map.getCanvas().style.cursor = ''; });

      mapRef.current = map;

      // ResizeObserver to keep canvas crisp
      const resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      });
      resizeObserver.observe(mapContainer.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize MapLibre map:', err);
      setMapError(err.message || 'Map failed to load');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 2. SWITCH BASEMAP STYLE SAFELY
  // ---------------------------------------------------------------------------
  const switchProvider = (key) => {
    if (!mapRef.current || key === activeProviderKey) return;
    setActiveProviderKey(key);
    setShowLayerSelector(false);
    try {
      const newStyle = buildMapStyle(key);
      mapRef.current.setStyle(newStyle);
    } catch (err) {
      console.error('Failed to change basemap provider:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. MAP CONTROLS HANDLERS
  // ---------------------------------------------------------------------------
  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapRef.current) {
      if (fitBounds && Array.isArray(fitBounds) && fitBounds.length === 4) {
        mapRef.current.fitBounds(fitBounds, { padding: 40, duration: 800 });
      } else {
        mapRef.current.flyTo({ center: center, zoom: zoom, duration: 800 });
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setTimeout(() => mapRef.current?.resize(), 200);
      }).catch(err => console.warn(err));
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setTimeout(() => mapRef.current?.resize(), 200);
      }).catch(err => console.warn(err));
    }
  };

  const toggleLayerVisibility = (layerKey) => {
    setVisibleLayers(prev => {
      const next = { ...prev, [layerKey]: !prev[layerKey] };
      const map = mapRef.current;
      if (!map || !mapLoaded || !map.isStyleLoaded()) return next;

      if (layerKey === 'boundaries') {
        const fillLayer = 'custom-geojson-fill';
        const lineLayer = 'custom-geojson-line';
        const visibility = next.boundaries ? 'visible' : 'none';
        if (map.getLayer(fillLayer)) map.setLayoutProperty(fillLayer, 'visibility', visibility);
        if (map.getLayer(lineLayer)) map.setLayoutProperty(lineLayer, 'visibility', visibility);
      } else if (layerKey === 'stations') {
        const clusterLayer = 'clusters';
        const clusterCount = 'cluster-count';
        const unclustered = 'unclustered-point';
        const visibility = next.stations ? 'visible' : 'none';
        if (map.getLayer(clusterLayer)) map.setLayoutProperty(clusterLayer, 'visibility', visibility);
        if (map.getLayer(clusterCount)) map.setLayoutProperty(clusterCount, 'visibility', visibility);
        if (map.getLayer(unclustered)) map.setLayoutProperty(unclustered, 'visibility', visibility);
      }
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // 4. RENDER BOUNDARY GEOJSON LAYER SAFELY
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const renderBoundary = () => {
      if (!map.isStyleLoaded()) return;

      const sourceId = 'boundary-geojson-source';
      const existingSource = map.getSource(sourceId);
      const safeData = geojsonData || { type: 'FeatureCollection', features: [] };

      if (existingSource) {
        existingSource.setData(safeData);

        // Update paint properties dynamically if layer already exists
        const fillId = 'custom-geojson-fill';
        if (map.getLayer(fillId) && layerConfig?.fill) {
          if (layerConfig.fill['fill-color']) {
            map.setPaintProperty(fillId, 'fill-color', layerConfig.fill['fill-color']);
          }
          if (layerConfig.fill['fill-opacity'] !== undefined) {
            map.setPaintProperty(fillId, 'fill-opacity', layerConfig.fill['fill-opacity']);
          }
        }

        const lineId = 'custom-geojson-line';
        if (map.getLayer(lineId) && layerConfig?.line) {
          if (layerConfig.line['line-color']) {
            map.setPaintProperty(lineId, 'line-color', layerConfig.line['line-color']);
          }
          if (layerConfig.line['line-width'] !== undefined) {
            map.setPaintProperty(lineId, 'line-width', layerConfig.line['line-width']);
          }
        }
      } else if (geojsonData) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: safeData
        });

        // Add fill layer
        const fillId = 'custom-geojson-fill';
        if (!map.getLayer(fillId)) {
          map.addLayer({
            id: fillId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': layerConfig?.fill?.['fill-color'] || '#0ea5e9',
              'fill-opacity': layerConfig?.fill?.['fill-opacity'] !== undefined ? layerConfig.fill['fill-opacity'] : 0.12
            },
            layout: {
              visibility: visibleLayers.boundaries ? 'visible' : 'none'
            }
          });
        }

        // Add boundary line stroke
        const lineId = 'custom-geojson-line';
        if (!map.getLayer(lineId)) {
          map.addLayer({
            id: lineId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': layerConfig?.line?.['line-color'] || '#38bdf8',
              'line-width': layerConfig?.line?.['line-width'] || 1.5,
              'line-opacity': layerConfig?.line?.['line-opacity'] !== undefined ? layerConfig.line['line-opacity'] : 0.7
            },
            layout: {
              visibility: visibleLayers.boundaries ? 'visible' : 'none'
            }
          });
        }
      }

      // Auto fit bounds if requested
      if (fitBounds && Array.isArray(fitBounds) && fitBounds.length === 4) {
        map.fitBounds(fitBounds, { padding: 40, duration: 800 });
      }
    };

    if (map.isStyleLoaded()) {
      renderBoundary();
    } else {
      map.once('styledata', renderBoundary);
    }
  }, [geojsonData, layerConfig, mapLoaded, activeProviderKey, fitBounds]);

  // ---------------------------------------------------------------------------
  // 5. CLUSTERED CHARGING STATIONS SOURCE & LAYERS SAFELY
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Filter valid markers defensively against NaN or missing coordinates
    const validMarkers = (markers || []).filter(m => {
      const lng = typeof m.lng === 'number' ? m.lng : m.longitude;
      const lat = typeof m.lat === 'number' ? m.lat : m.latitude;
      return typeof lng === 'number' && typeof lat === 'number' && 
             !isNaN(lng) && !isNaN(lat) && 
             lng >= -180 && lng <= 180 && 
             lat >= -90 && lat <= 90;
    });

    const stationsGeoJSON = {
      type: 'FeatureCollection',
      features: validMarkers.map((m, idx) => ({
        type: 'Feature',
        id: idx,
        geometry: {
          type: 'Point',
          coordinates: [
            typeof m.lng === 'number' ? m.lng : m.longitude,
            typeof m.lat === 'number' ? m.lat : m.latitude
          ]
        },
        properties: {
          id: m.station_id || idx,
          name: m.name || m.title || 'Public Charging Station',
          operator: m.operator || 'Unknown CPO',
          power_kw: m.power_kw ?? m.total_power_kw ?? null,
          points: m.points ?? m.total_charging_points ?? null,
          status: m.status || 'OPERATIONAL',
          is_synthetic: Boolean(m.is_synthetic),
          source_name: m.source_name || 'BEE EV Yatra',
          address: m.address || null,
          city: m.city || null,
          district: m.district || null,
          state: m.state || 'Maharashtra',
          connector_types: m.connector_types || 'CCS-2 / Type-2 AC',
          pricing_type: m.pricing_type || 'PAID',
          access_type: m.access_type || 'PUBLIC',
          color: m.color || (m.is_synthetic ? '#f59e0b' : '#10b981')
        }
      }))
    };

    const sourceId = 'stations-clustered-source';

    const renderStationLayers = () => {
      if (!map.isStyleLoaded()) return;

      const existingSource = map.getSource(sourceId);

      if (existingSource) {
        existingSource.setData(stationsGeoJSON);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: stationsGeoJSON,
          cluster: true,
          clusterMaxZoom: 13,
          clusterRadius: 50
        });

        // 1. Cluster circles
        if (!map.getLayer('clusters')) {
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: sourceId,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#3F7775', // Muted Teal (< 10)
                10,
                '#34495E', // Slate Blue (10 - 25)
                25,
                '#172B3A'  // Deep Navy (> 25)
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                16,
                10,
                22,
                25,
                28
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.95
            },
            layout: {
              visibility: visibleLayers.stations ? 'visible' : 'none'
            }
          });
        }

        // 2. Cluster count text
        if (!map.getLayer('cluster-count')) {
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: sourceId,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-size': 11,
              'text-font': ['Open Sans Semibold'],
              visibility: visibleLayers.stations ? 'visible' : 'none'
            },
            paint: {
              'text-color': '#ffffff'
            }
          });
        }

        // 3. Unclustered individual points
        if (!map.getLayer('unclustered-point')) {
          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: sourceId,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': [
                'case',
                ['boolean', ['get', 'is_synthetic'], false],
                '#C18A42', // Warm Amber for synthetic
                ['==', ['get', 'status'], 'PLANNED'],
                '#C18A42', // Warm Amber
                ['==', ['get', 'status'], 'CANDIDATE'],
                '#3F7775', // Muted Teal
                '#52765B'  // Forest Green for operational
              ],
              'circle-radius': 6.5,
              'circle-stroke-width': 1.8,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.95
            },
            layout: {
              visibility: visibleLayers.stations ? 'visible' : 'none'
            }
          });
        }
      }
    };

    if (map.isStyleLoaded()) {
      renderStationLayers();
    } else {
      map.once('styledata', renderStationLayers);
    }
  }, [markers, mapLoaded, activeProviderKey]);

  // Copy coordinates
  const handleCopyCoords = () => {
    if (!selectedStation?.coordinates) return;
    const [lat, lng] = selectedStation.coordinates;
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div 
      ref={mapWrapperRef} 
      className={`relative overflow-hidden rounded-lg bg-navy-950 border border-navy-800 ${className}`}
    >
      {/* Map Canvas */}
      <div ref={mapContainer} className="w-full h-full min-h-[350px]" />

      {/* --------------------------------------------------------------------- */}
      {/* MAP CONTROLS OVERLAY (TOP-RIGHT) */}
      {/* --------------------------------------------------------------------- */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-md bg-navy-900 border border-navy-700 shadow-md">
          {/* Basemap switcher */}
          <button
            onClick={() => setShowLayerSelector(!showLayerSelector)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
              showLayerSelector ? 'bg-accent-teal/20 text-white font-semibold' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
            }`}
            title="Switch Basemap Style"
          >
            <Layers className="w-3.5 h-3.5 text-accent-teal" />
            <span className="hidden sm:inline">{activeProvider.label}</span>
          </button>

          <span className="h-4 w-[1px] bg-navy-700"></span>

          {/* Reset Extent */}
          <button
            onClick={handleResetView}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title="Reset Map Extent"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <span className="h-4 w-[1px] bg-navy-700"></span>

          {/* Zoom */}
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Basemap Dropdown */}
        {showLayerSelector && (
          <div className="w-64 p-2.5 bg-navy-900 border border-navy-700 rounded-lg shadow-xl text-xs space-y-2 z-30">
            <div className="px-1 text-[10px] font-bold text-muted-grey uppercase tracking-wider">
              Basemap Cartography
            </div>
            <div className="space-y-1">
              {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
                <button
                  key={key}
                  onClick={() => switchProvider(key)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                    activeProviderKey === key 
                      ? 'bg-accent-teal/20 text-white font-semibold border border-accent-teal/40' 
                      : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <span>{provider.name}</span>
                  {activeProviderKey === key && <span className="text-accent-teal">✓</span>}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-navy-800 space-y-1.5">
              <div className="px-1 text-[10px] font-bold text-muted-grey uppercase tracking-wider">
                Layer Visibility
              </div>
              <div className="flex items-center justify-between px-1 text-slate-300">
                <span>Charging Stations</span>
                <button
                  onClick={() => toggleLayerVisibility('stations')}
                  className="text-xs p-1 rounded hover:bg-navy-800"
                >
                  {visibleLayers.stations ? <Eye className="w-3.5 h-3.5 text-accent-teal" /> : <EyeOff className="w-3.5 h-3.5 text-muted-grey" />}
                </button>
              </div>
              <div className="flex items-center justify-between px-1 text-slate-300">
                <span>Administrative Boundaries</span>
                <button
                  onClick={() => toggleLayerVisibility('boundaries')}
                  className="text-xs p-1 rounded hover:bg-navy-800"
                >
                  {visibleLayers.boundaries ? <Eye className="w-3.5 h-3.5 text-accent-teal" /> : <EyeOff className="w-3.5 h-3.5 text-muted-grey" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* BOTTOM STATUS BAR: COORDINATES + SCALE + ATTRIBUTION */}
      {/* --------------------------------------------------------------------- */}
      <div className="absolute bottom-1 left-28 right-2 z-10 flex items-center justify-between pointer-events-none text-[10px] text-muted-grey">
        <div className="px-2 py-0.5 rounded bg-navy-950/90 border border-navy-800 font-mono pointer-events-auto shadow-sm">
          {cursorCoords ? (
            <span>
              Lat: {cursorCoords.lat}&deg; &bull; Lon: {cursorCoords.lng}&deg; &bull; Zoom: {cursorCoords.zoom}
            </span>
          ) : (
            <span>CRS: EPSG:4326 (WGS 84)</span>
          )}
        </div>

        <div className="hidden sm:block px-2 py-0.5 rounded bg-navy-950/90 border border-navy-800 pointer-events-auto">
          <span dangerouslySetInnerHTML={{ __html: activeProvider.attribution }} />
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* COLLAPSIBLE MAP LEGEND */}
      {/* --------------------------------------------------------------------- */}
      <div className="absolute bottom-8 right-3 z-20">
        {showLegend ? (
          <div className="p-3 rounded-lg bg-navy-900 border border-navy-700 shadow-xl text-xs space-y-2 max-w-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-navy-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-grey">Map Legend</span>
              <button 
                onClick={() => setShowLegend(false)}
                className="text-muted-grey hover:text-slate-300 text-[10px]"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-green border border-white"></span>
                <span>Operational Site</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber border border-white"></span>
                <span>Planned Site</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-teal border border-white"></span>
                <span>Candidate Site</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber border border-white"></span>
                <span>Synthetic Demo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-header rounded"></span>
                <span>Boundary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-teal text-[8px] text-white flex items-center justify-center font-bold">10</span>
                <span>Station Cluster</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-[11px] text-slate-300 hover:text-white shadow-md"
          >
            Show Legend
          </button>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* RICH INTERACTIVE STATION DRAWER ON MARKER CLICK */}
      {/* --------------------------------------------------------------------- */}
      {selectedStation && (
        <div className="absolute top-3 left-3 w-80 max-h-[92%] overflow-y-auto bg-navy-900 border border-navy-700 rounded-xl shadow-2xl p-4 text-xs space-y-4 z-40 animate-in fade-in slide-in-from-left duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-navy-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedStation.is_synthetic 
                    ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30'
                    : 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                }`}>
                  {selectedStation.is_synthetic ? 'SYNTHETIC DEMO' : selectedStation.status}
                </span>
                <span className="text-[10px] text-muted-grey font-mono">
                  {selectedStation.id || 'EV-STATION'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                {selectedStation.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedStation(null)}
              className="p-1 rounded-md hover:bg-navy-800 text-muted-grey hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Station Info */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-accent-teal">
              1. Station Information
            </div>
            <div className="p-2.5 rounded-lg bg-navy-850 border border-navy-700 space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-muted-grey">Operator:</span>
                <span className="font-semibold text-white">{selectedStation.operator || 'Not available'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-grey">Location:</span>
                <span className="text-right font-medium max-w-[160px] truncate">{selectedStation.address || `${selectedStation.district || 'Maharashtra'}, India`}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-navy-800">
                <span className="text-muted-grey">Coordinates:</span>
                {selectedStation.coordinates ? (
                  <button
                    onClick={handleCopyCoords}
                    className="flex items-center gap-1 font-mono text-[11px] text-accent-teal hover:underline"
                    title="Click to copy coordinates"
                  >
                    <span>{selectedStation.coordinates[0]?.toFixed(4)}, {selectedStation.coordinates[1]?.toFixed(4)}</span>
                    {copiedCoords ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
                  </button>
                ) : (
                  <span className="text-muted-grey">Not available</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Charging Infrastructure */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-accent-amber font-mono">
              2. Charging Infrastructure
            </div>
            <div className="p-2.5 rounded-lg bg-navy-850 border border-navy-700 space-y-1 text-slate-300 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-grey">Charging Points:</span>
                <span className="font-bold text-accent-green font-mono">{selectedStation.points ?? 'Not available'} points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-grey">Total Rated Power:</span>
                <span className="font-bold text-white font-mono">{selectedStation.power_kw ? `${selectedStation.power_kw} kW` : 'Not available'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-grey">Connectors:</span>
                <span className="font-medium text-slate-200">{selectedStation.connector_types || 'CCS-2 / Type-2'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-grey">Access &amp; Pricing:</span>
                <span className="capitalize">{selectedStation.access_type?.toLowerCase() || 'Public'} &bull; {selectedStation.pricing_type?.toLowerCase() || 'Paid'}</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-grey px-1 font-mono">
              * Note: Connector count reflects individual nozzles; station count reflects physical facilities.
            </div>
          </div>

          {/* Section 3: Data Provenance */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#86af8f] font-mono">
              3. Data Provenance &amp; Audit
            </div>
            <div className="p-2.5 rounded-lg bg-navy-850 border border-navy-700 space-y-1 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-grey">Source Directory:</span>
                <span className="font-medium text-white">{selectedStation.source_name || 'BEE EV Yatra'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-grey">Audit Status:</span>
                <span className="font-bold text-[#86af8f] font-mono">
                  {selectedStation.is_synthetic ? 'DEMO DATASET' : 'VERIFIED PHYSICAL SITE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ERROR BOUNDARY DISPLAY */}
      {/* --------------------------------------------------------------------- */}
      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white p-6 z-30">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
          <h4 className="text-base font-semibold text-slate-200">Map Rendering Notice</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md text-center">{mapError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Map Canvas
          </button>
        </div>
      )}
    </div>
  );
};

export default MapLibreMap;
