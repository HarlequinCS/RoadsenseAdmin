"use client";

import { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Hazard } from "@/lib/types";
import { statusChartColors } from "@/lib/style-helpers";
import StatusBadge from "./StatusBadge";

const DEFAULT_CENTER = { lat: 2.1896, lng: 102.2501 };

const containerStyle = {
  width: "100%",
  height: "320px",
  borderRadius: "8px",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function HazardMap({ hazards }: { hazards: Hazard[] }) {
  const { isLoaded } = useJsApiLoader({
    id: "roadsense-google-map",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selected, setSelected] = useState<Hazard | null>(null);

  const validHazards = hazards.filter(
    (h) => typeof h.latitude === "number" && typeof h.longitude === "number"
  );

  const center =
    validHazards.length > 0
      ? {
          lat: validHazards.reduce((sum, h) => sum + h.latitude, 0) / validHazards.length,
          lng: validHazards.reduce((sum, h) => sum + h.longitude, 0) / validHazards.length,
        }
      : DEFAULT_CENTER;

  const getIcon = useCallback((status: Hazard["status"]) => {
    if (typeof window === "undefined" || !window.google) return undefined;
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: statusChartColors[status] || "#888",
      fillOpacity: 0.9,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: 9,
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-[320px] rounded-lg bg-fog-100 dark:bg-asphalt-800 animate-pulse flex items-center justify-center">
        <p className="text-xs text-fog-400">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-fog-200 dark:border-asphalt-700">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
      >
        {validHazards.map((h) => (
          <MarkerF
            key={h.id}
            position={{ lat: h.latitude, lng: h.longitude }}
            icon={getIcon(h.status)}
            onClick={() => setSelected(h)}
          />
        ))}

        {selected && (
          <InfoWindowF
            position={{ lat: selected.latitude, lng: selected.longitude }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ fontSize: "13px", lineHeight: 1.5, minWidth: "140px" }}>
              <p style={{ fontWeight: 600, margin: 0 }}>{selected.hazardType}</p>
              <p style={{ margin: "2px 0 6px", color: "#5C5A56" }}>{selected.reporterName}</p>
              <StatusBadge status={selected.status} />
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}