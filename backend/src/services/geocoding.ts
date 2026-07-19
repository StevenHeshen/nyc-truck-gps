import { Coordinate } from "@nyc-truck-gps/shared";

const DEFAULT_GEOCODER_URL = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
const NYC_BOUNDS = { south: 40.4774, north: 40.9176, west: -74.2591, east: -73.7004 };

interface CensusGeocoderResponse {
  result?: { addressMatches?: Array<{ matchedAddress?: string; coordinates?: { x?: number; y?: number } }> };
}

export class GeocodingError extends Error {}

export async function geocodeNycAddress(
  address: string,
  options: { baseUrl?: string; fetchImpl?: typeof fetch } = {}
): Promise<Coordinate> {
  const url = new URL(options.baseUrl ?? process.env.GEOCODER_URL ?? DEFAULT_GEOCODER_URL);
  url.searchParams.set("address", normalizeNycAddress(address));
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");

  const response = await (options.fetchImpl ?? fetch)(url, {
    headers: { "User-Agent": "nyc-truck-gps/0.1 (address geocoding)" },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new GeocodingError(`Geocoder returned ${response.status}`);

  const payload = await response.json() as CensusGeocoderResponse;
  const match = payload.result?.addressMatches?.[0];
  const longitude = match?.coordinates?.x;
  const latitude = match?.coordinates?.y;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new GeocodingError(`No address match found for: ${address}`);
  }
  if (!isInsideNyc({ latitude, longitude })) {
    throw new GeocodingError(`Address is outside New York City: ${match?.matchedAddress ?? address}`);
  }
  return { latitude, longitude };
}

function normalizeNycAddress(address: string) {
  return /\bNY\b|New York/i.test(address) ? address : `${address}, New York, NY`;
}

function isInsideNyc({ latitude, longitude }: Coordinate) {
  return latitude >= NYC_BOUNDS.south && latitude <= NYC_BOUNDS.north
    && longitude >= NYC_BOUNDS.west && longitude <= NYC_BOUNDS.east;
}
