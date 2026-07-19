import { RouteRequest, TruckRouteOption } from "@nyc-truck-gps/shared";

interface ValhallaResponse {
  trip?: {
    summary?: { length?: number; time?: number };
    legs?: Array<{
      shape?: string;
      maneuver?: Array<{ instruction?: string }>;
    }>;
  };
}

export function buildValhallaPayload(request: RouteRequest) {
  if (!request.originCoordinate || !request.destinationCoordinate) {
    throw new Error("Coordinates are required for Valhalla routing");
  }

  return {
    locations: [
      { lat: request.originCoordinate.latitude, lon: request.originCoordinate.longitude, type: "break" },
      { lat: request.destinationCoordinate.latitude, lon: request.destinationCoordinate.longitude, type: "break" }
    ],
    costing: "truck",
    costing_options: {
      truck: {
        height: feetToMeters(request.vehicle.heightFt + request.vehicle.heightIn / 12),
        width: feetToMeters(request.vehicle.widthFt),
        length: feetToMeters(request.vehicle.lengthFt),
        weight: poundsToMetricTons(request.vehicle.weightLbs),
        axle_count: request.vehicle.axles,
        hazmat: request.vehicle.hasHazmat
      }
    },
    units: "miles",
    language: "en-US",
    directions_options: { units: "miles" }
  };
}

export async function requestValhallaRoute(
  request: RouteRequest,
  baseUrl: string,
  fetcher: typeof fetch = fetch
): Promise<TruckRouteOption> {
  const response = await fetcher(`${baseUrl.replace(/\/$/, "")}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildValhallaPayload(request)),
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`Valhalla returned ${response.status}`);

  const payload = (await response.json()) as ValhallaResponse;
  const legs = payload.trip?.legs ?? [];
  const geometry = legs.flatMap((leg) => leg.shape ? decodePolyline6(leg.shape) : []);
  if (geometry.length < 2) throw new Error("Valhalla response did not include route geometry");

  return {
    id: "safe",
    name: "Valhalla truck route",
    etaMinutes: Math.max(1, Math.round((payload.trip?.summary?.time ?? 0) / 60)),
    distanceMiles: round(payload.trip?.summary?.length ?? 0, 1),
    tollEstimateUsd: 0,
    compliance: "High",
    description: "Calculated by Valhalla using the supplied truck dimensions, weight, axle count, and Hazmat status.",
    riskIds: [],
    steps: legs.flatMap((leg) => leg.maneuver?.map((item) => item.instruction).filter((item): item is string => Boolean(item)) ?? []),
    geometry
  };
}

export function decodePolyline6(encoded: string) {
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const coordinates: Array<{ latitude: number; longitude: number }> = [];

  while (index < encoded.length) {
    const latitudeResult = decodeValue(encoded, index);
    index = latitudeResult.index;
    latitude += latitudeResult.value;
    const longitudeResult = decodeValue(encoded, index);
    index = longitudeResult.index;
    longitude += longitudeResult.value;
    coordinates.push({ latitude: latitude / 1e6, longitude: longitude / 1e6 });
  }
  return coordinates;
}

function decodeValue(encoded: string, startIndex: number) {
  let result = 0;
  let shift = 0;
  let index = startIndex;
  let byte: number;
  do {
    if (index >= encoded.length) throw new Error("Invalid encoded polyline");
    byte = encoded.charCodeAt(index++) - 63;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20);
  return { index, value: result & 1 ? ~(result >> 1) : result >> 1 };
}

function feetToMeters(value: number) {
  return round(value * 0.3048, 3);
}

function poundsToMetricTons(value: number) {
  return round(value * 0.00045359237, 3);
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
