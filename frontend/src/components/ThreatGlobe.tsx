// src/components/ThreatGlobe.tsx
import { useEffect, useRef } from "react";
import type { GlobeInstance } from "globe.gl";
import type { Alert } from "../types/alert";

interface ThreatGlobeProps {
  alerts: Alert[];
}

interface GlobePoint {
  lat: number;
  lng: number;
  radius: number;
  color: string;
  label: string;
}

// Map IP prefix to approximate lat/lng for known regions
function ipToLatLng(ip: string): { lat: number; lng: number } | null {
  const parts = ip.split(".");
  if (parts.length < 2) return null;
  const first = parseInt(parts[0]);
  const second = parseInt(parts[1]);
  if (isNaN(first) || isNaN(second)) return null;
  if (first >= 1   && first <= 50)  return { lat: 35 + (second % 20), lng: 105 + (second % 30) };  // Asia
  if (first >= 51  && first <= 100) return { lat: 48 + (second % 15), lng: 10  + (second % 20) };  // Europe
  if (first >= 101 && first <= 150) return { lat: 37 + (second % 15), lng: -95 + (second % 30) }; // North America
  if (first >= 151 && first <= 180) return { lat: -15 + (second % 20), lng: -55 + (second % 30) }; // South America
  if (first >= 181 && first <= 210) return { lat: -25 + (second % 20), lng: 25  + (second % 30) }; // Africa/Middle East
  return { lat: (second % 140) - 70, lng: ((first * 7 + second * 3) % 360) - 180 };
}

function buildAlertPoints(alerts: Alert[]): GlobePoint[] {
  return alerts
    .slice(0, 80)
    .map((a): GlobePoint | null => {
      const pos = ipToLatLng(a.sourceIp);
      if (!pos) return null;
      return {
        lat: pos.lat,
        lng: pos.lng,
        radius: a.severity === "Critical" ? 0.55 : a.severity === "High" ? 0.4 : 0.28,
        color:
          a.severity === "Critical" ? "#ef4444"
          : a.severity === "High"   ? "#f97316"
          : "#facc15",
        label: `${a.type} — ${a.sourceIp}`,
      };
    })
    .filter((p): p is GlobePoint => p !== null);
}

const AMBIENT_DOTS: GlobePoint[] = [
  { lat: 40.7,  lng: -74,    radius: 0.22, color: "#22d3ee", label: "New York" },
  { lat: 51.5,  lng: -0.1,   radius: 0.22, color: "#22d3ee", label: "London" },
  { lat: 35.7,  lng: 139.7,  radius: 0.22, color: "#22d3ee", label: "Tokyo" },
  { lat: 1.3,   lng: 103.8,  radius: 0.18, color: "#22d3ee", label: "Singapore" },
  { lat: 55.7,  lng: 37.6,   radius: 0.22, color: "#f97316", label: "Moscow" },
  { lat: 39.9,  lng: 116.4,  radius: 0.28, color: "#ef4444", label: "Beijing" },
  { lat: -23.5, lng: -46.6,  radius: 0.18, color: "#22d3ee", label: "São Paulo" },
  { lat: 19.1,  lng: 72.9,   radius: 0.18, color: "#22d3ee", label: "Mumbai" },
  { lat: 48.9,  lng: 2.3,    radius: 0.22, color: "#22d3ee", label: "Paris" },
  { lat: 37.6,  lng: -122.4, radius: 0.28, color: "#ef4444", label: "San Francisco" },
  { lat: -33.9, lng: 151.2,  radius: 0.18, color: "#22d3ee", label: "Sydney" },
  { lat: 25.2,  lng: 55.3,   radius: 0.18, color: "#f97316", label: "Dubai" },
];

export function ThreatGlobe({ alerts }: ThreatGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    async function init() {
      const mod = await import("globe.gl");
      if (cancelled || !containerRef.current) return;
      const Globe = mod.default;
      const el = containerRef.current;

      const allPoints: GlobePoint[] = [...AMBIENT_DOTS, ...buildAlertPoints(alerts)];

      const globe = new Globe(el)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        // ── Flat glowing dots — altitude 0 keeps them on the surface ──
        .pointsData(allPoints)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor("color")
        .pointRadius("radius")
        .pointAltitude(0)          // <-- 0 = flat dot, no extrusion/spike
        .pointResolution(12)       // smoother circles
        .pointsMerge(false)
        .atmosphereColor("#22d3ee")
        .atmosphereAltitude(0.18)
        .width(el.offsetWidth)
        .height(el.offsetHeight);

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = false;

      if (!cancelled) globeRef.current = globe;
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
      globeRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update dots when alerts change without re-initializing
  useEffect(() => {
    if (!globeRef.current) return;
    const allPoints: GlobePoint[] = [...AMBIENT_DOTS, ...buildAlertPoints(alerts)];
    globeRef.current.pointsData(allPoints);
  }, [alerts]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: "grab" }}
      aria-label="Interactive threat globe showing global IP traffic"
    />
  );
}

export default ThreatGlobe;
