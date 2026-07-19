import { TruckRouteSegment } from "@nyc-truck-gps/shared";

const DATASET_ID = "jjja-shxy";
const DATASET_URL = `https://data.cityofnewyork.us/Transportation/New-York-City-Truck-Routes/${DATASET_ID}`;
const API_URL = `https://data.cityofnewyork.us/resource/${DATASET_ID}.geojson`;
const CACHE_TTL_MS = 15 * 60 * 1000;

interface SocrataFeature {
  type?: unknown;
  geometry?: {
    type?: unknown;
    coordinates?: unknown;
  };
  properties?: Record<string, unknown>;
}

interface SocrataFeatureCollection {
  features?: SocrataFeature[];
}

interface CacheEntry {
  expiresAt: number;
  segments: TruckRouteSegment[];
}

const cache = new Map<string, CacheEntry>();

export function transformOfficialTruckRoute(feature: SocrataFeature): TruckRouteSegment | null {
  if (feature.geometry?.type !== "MultiLineString" || !Array.isArray(feature.geometry.coordinates)) return null;
  const properties = feature.properties ?? {};
  const id = stringValue(properties.segmentid) || stringValue(properties.objectid_1);
  if (!id) return null;

  const routeTypeValue = stringValue(properties.routetype);
  const routeType = routeTypeValue === "Local" || routeTypeValue === "Through" ? routeTypeValue : "Unknown";

  return {
    id: `nycdot-${id}`,
    street: stringValue(properties.street) || "Unnamed truck route",
    borough: stringValue(properties.boroname) || "Unknown",
    routeType,
    regulation: stringValue(properties.nyc_reg) || undefined,
    geometry: {
      type: "MultiLineString",
      coordinates: feature.geometry.coordinates as number[][][]
    },
    source: {
      kind: "official",
      name: "NYC DOT — New York City Truck Routes",
      url: DATASET_URL
    }
  };
}

export interface TruckRouteBounds {
  north: number;
  west: number;
  south: number;
  east: number;
}

export async function fetchOfficialTruckRoutes(options: { borough?: string; bounds?: TruckRouteBounds; limit: number }) {
  const borough = options.borough?.trim();
  const boundsKey = options.bounds
    ? [options.bounds.north, options.bounds.west, options.bounds.south, options.bounds.east].map((value) => value.toFixed(4)).join(":")
    : "all";
  const cacheKey = `${borough?.toLowerCase() ?? "all"}:${boundsKey}:${options.limit}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return { segments: cached.segments, cached: true };

  const params = new URLSearchParams({ $limit: String(options.limit), $order: "segmentid" });
  const filters: string[] = [];
  if (borough) filters.push(`lower(boroname)='${escapeSoqlLiteral(borough.toLowerCase())}'`);
  if (options.bounds) {
    const { north, west, south, east } = options.bounds;
    filters.push(`within_box(the_geom, ${north}, ${west}, ${south}, ${east})`);
  }
  if (filters.length) params.set("$where", filters.join(" AND "));

  const response = await fetch(`${API_URL}?${params}`, {
    headers: { Accept: "application/geo+json", "User-Agent": "nyc-truck-gps/0.1" },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`NYC Open Data returned ${response.status}`);

  const payload = (await response.json()) as SocrataFeatureCollection;
  const segments = (payload.features ?? [])
    .map(transformOfficialTruckRoute)
    .filter((segment): segment is TruckRouteSegment => segment !== null);
  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, segments });
  return { segments, cached: false };
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeSoqlLiteral(value: string): string {
  return value.replaceAll("'", "''");
}

export const officialTruckRouteSource = {
  datasetId: DATASET_ID,
  name: "NYC DOT — New York City Truck Routes",
  url: DATASET_URL,
  apiUrl: API_URL
};
