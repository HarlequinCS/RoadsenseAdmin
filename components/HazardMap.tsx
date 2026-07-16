"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Hazard } from "@/lib/types";
import { riskChartColors, statusChartColors } from "@/lib/style-helpers";
import StatusBadge from "./StatusBadge";
import RiskBadge from "./RiskBadge";

const DEFAULT_CENTER = { lat: 3.0738, lng: 101.5183 };

type ColorMode = "status" | "risk";

interface HazardMapProps {
  hazards: Hazard[];
  activeOnly?: boolean;
  colorBy?: ColorMode;
  height?: number;
}

export default function HazardMap({
  hazards,
  activeOnly = false,
  colorBy = "status",
  height = 320,
}: HazardMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "roadsense-google-map",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selected, setSelected] = useState<Hazard | null>(null);

  const visibleHazards = hazards
    .filter((h) => (activeOnly ? h.status !== "Resolved" : true))
    .filter((h) => typeof h.latitude === "number" && typeof h.longitude === "number");

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
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: getColor(hazard),
        fillOpacity: 0.9,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: hazard.riskLevel === "Critical" ? 11 : 9,
      };
    },
    [getColor]
  );

  const containerStyle = {
    width: "100%",
    height: `${height}px`,
    borderRadius: "8px",
  };

  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
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

  return (
    <div className="rounded-lg overflow-hidden border border-fog-200 dark:border-asphalt-700">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} options={mapOptions}>
        {visibleHazards.map((h) => (
          <MarkerF
            key={h.id}
            position={{ lat: h.latitude, lng: h.longitude }}
            icon={getIcon(h)}
            onClick={() => setSelected(h)}
          />
        ))}

        {selected && (
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
    </div>
  );
}
