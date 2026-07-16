"use client";

import { useState, useCallback, useLayoutEffect, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Hazard } from "@/lib/types";
import { riskChartColors, statusChartColors } from "@/lib/style-helpers";
import StatusBadge from "./StatusBadge";
import RiskBadge from "./RiskBadge";
import HazardMapPanel from "./HazardMapPanel";
import HazardMapList from "./HazardMapList";

const DEFAULT_CENTER = { lat: 3.0738, lng: 101.5183 };
const FOCUS_ZOOM = 17;
const SINGLE_MARKER_ZOOM = 15;

type ColorMode = "status" | "risk";
type MapLayout = "default" | "with-panel";

interface HazardMapProps {
  hazards: Hazard[];
  activeOnly?: boolean;
  colorBy?: ColorMode;
  height?: number;
  layout?: MapLayout;
}

function fitMapToHazards(
  map: google.maps.Map,
  hazardList: Hazard[],
  padding = 48
) {
  if (hazardList.length === 0) return;

  if (hazardList.length === 1) {
    const h = hazardList[0];
    map.setCenter({ lat: h.latitude, lng: h.longitude });
    map.setZoom(SINGLE_MARKER_ZOOM);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  hazardList.forEach((h) => bounds.extend({ lat: h.latitude, lng: h.longitude }));
  map.fitBounds(bounds, padding);
}

export default function HazardMap({
  hazards,
  activeOnly = false,
  colorBy = "status",
  height = 320,
  layout = "default",
}: HazardMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "roadsense-google-map",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selected, setSelected] = useState<Hazard | null>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const usePanel = layout === "with-panel";

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const focusOnHazard = useCallback(
    (hazard: Hazard) => {
      if (!map) return;
      map.panTo({ lat: hazard.latitude, lng: hazard.longitude });
      map.setZoom(FOCUS_ZOOM);
    },
    [map]
  );

  const handleSelectHazard = useCallback(
    (hazard: Hazard) => {
      setSelected(hazard);
      focusOnHazard(hazard);
    },
    [focusOnHazard]
  );

  const handleClosePanel = useCallback(() => {
    setSelected(null);
  }, []);

  useLayoutEffect(() => {
    const previous = (window as Window & { gm_authFailure?: () => void }).gm_authFailure;
    (window as Window & { gm_authFailure?: () => void }).gm_authFailure = () => {
      setAuthFailed(true);
    };
    return () => {
      if (previous) {
        (window as Window & { gm_authFailure?: () => void }).gm_authFailure = previous;
      } else {
        delete (window as Window & { gm_authFailure?: () => void }).gm_authFailure;
      }
    };
  }, []);

  const visibleHazards = hazards
    .filter((h) => (activeOnly ? h.status !== "Resolved" : true))
    .filter((h) => typeof h.latitude === "number" && typeof h.longitude === "number");

  useEffect(() => {
    if (!map || visibleHazards.length === 0) return;
    fitMapToHazards(map, visibleHazards);
  }, [map, visibleHazards]);

  useEffect(() => {
    if (selected && !visibleHazards.some((h) => h.id === selected.id)) {
      setSelected(null);
    }
  }, [visibleHazards, selected]);

  const center =
    visibleHazards.length > 0
      ? {
          lat: visibleHazards.reduce((sum, h) => sum + h.latitude, 0) / visibleHazards.length,
          lng: visibleHazards.reduce((sum, h) => sum + h.longitude, 0) / visibleHazards.length,
        }
      : DEFAULT_CENTER;

  const getColor = useCallback(
    (hazard: Hazard) => {
      if (colorBy === "risk") {
        return riskChartColors[hazard.riskLevel as keyof typeof riskChartColors] || "#888";
      }
      return statusChartColors[hazard.status] || "#888";
    },
    [colorBy]
  );

  const getIcon = useCallback(
    (hazard: Hazard) => {
      if (typeof window === "undefined" || !window.google) return undefined;
      const isSelected = selected?.id === hazard.id;
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: getColor(hazard),
        fillOpacity: 0.9,
        strokeColor: isSelected ? "#12151b" : "#ffffff",
        strokeWeight: isSelected ? 3 : 2,
        scale: hazard.riskLevel === "Critical" ? 11 : 9,
      };
    },
    [getColor, selected]
  );

  const containerStyle = {
    width: "100%",
    height: `${height}px`,
    borderRadius: usePanel ? "0" : "8px",
  };

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: !usePanel,
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div
        className="rounded-lg bg-fog-100 dark:bg-asphalt-800 flex items-center justify-center border border-fog-200 dark:border-asphalt-700"
        style={{ height }}
      >
        <p className="text-xs text-fog-400 px-4 text-center">
          Set <code className="text-[10px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in .env.local to enable the map.
        </p>
      </div>
    );
  }

  if (loadError || authFailed) {
    const isReferrerError =
      authFailed ||
      loadError?.message?.includes("RefererNotAllowedMapError") ||
      loadError?.message?.includes("RefererNotAllowed");

    return (
      <div
        className="rounded-lg bg-fog-100 dark:bg-asphalt-800 flex items-center justify-center border border-amber-200 dark:border-amber-900/50"
        style={{ height }}
      >
        <div className="text-xs text-fog-500 px-6 text-center max-w-md space-y-3">
          <p className="font-medium text-asphalt-700 dark:text-fog-200">Google Maps could not load</p>
          {isReferrerError ? (
            <>
              <p>Your API key does not allow this website yet. In Google Cloud Console:</p>
              <ol className="text-left list-decimal list-inside space-y-1 text-fog-600 dark:text-fog-400">
                <li>Open APIs &amp; Services → Credentials</li>
                <li>Edit your Maps API key</li>
                <li>Enable <strong>Maps JavaScript API</strong></li>
                <li>Under HTTP referrers, add:</li>
              </ol>
              <code className="block text-[10px] bg-white dark:bg-asphalt-900 border border-fog-200 dark:border-asphalt-700 rounded px-2 py-1.5">
                https://roadsense.saifuliqbal.dev/*
              </code>
              <p className="text-[10px] text-fog-400">Save, wait 1–2 minutes, then hard-refresh (Ctrl+Shift+R).</p>
            </>
          ) : (
            <p>{loadError?.message || "Check billing and API restrictions in Google Cloud Console."}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="rounded-lg bg-fog-100 dark:bg-asphalt-800 animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-xs text-fog-400">Loading map…</p>
      </div>
    );
  }

  const mapElement = (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={SINGLE_MARKER_ZOOM}
      options={mapOptions}
      onLoad={onMapLoad}
    >
      {visibleHazards.map((h) => (
        <MarkerF
          key={h.id}
          position={{ lat: h.latitude, lng: h.longitude }}
          icon={getIcon(h)}
          onClick={() => handleSelectHazard(h)}
        />
      ))}

      {!usePanel && selected && (
        <InfoWindowF
          position={{ lat: selected.latitude, lng: selected.longitude }}
          onCloseClick={() => setSelected(null)}
        >
          <div style={{ fontSize: "13px", lineHeight: 1.5, minWidth: "160px" }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{selected.hazardType}</p>
            <p style={{ margin: "2px 0 6px", color: "#5C5A56" }}>{selected.reporterName}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <StatusBadge status={selected.status} />
              <RiskBadge risk={selected.riskLevel} />
            </div>
            <a
              href={`/reports/${selected.id}`}
              style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#009EE3" }}
            >
              View report →
            </a>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );

  if (!usePanel) {
    return (
      <div className="rounded-lg overflow-hidden border border-fog-200 dark:border-asphalt-700">
        {mapElement}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col md:flex-row rounded-lg overflow-hidden border border-fog-200 dark:border-asphalt-700 bg-white dark:bg-asphalt-900"
      style={{ height }}
    >
      <div className="flex-1 min-w-0 relative min-h-[280px]">
        {mapElement}
        {!selected && visibleHazards.length > 0 && (
          <div className="absolute bottom-3 left-3 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-asphalt-900/90 text-fog-600 dark:text-fog-400 border border-fog-200 dark:border-asphalt-700 pointer-events-none">
            Select from the list or click a marker
          </div>
        )}
      </div>
      <aside
        className="w-full md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-fog-200 dark:border-asphalt-700 flex flex-col min-h-0"
        style={{ maxHeight: height }}
      >
        {selected ? (
          <HazardMapPanel
            hazard={selected}
            onClose={handleClosePanel}
            onUpdated={setSelected}
            onBackToList={handleClosePanel}
          />
        ) : (
          <HazardMapList
            hazards={visibleHazards}
            colorBy={colorBy}
            onSelect={handleSelectHazard}
          />
        )}
      </aside>
    </div>
  );
}
