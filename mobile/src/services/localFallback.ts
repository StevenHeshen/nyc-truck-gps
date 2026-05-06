import { buildTruckRouteResponse, RouteRequest, RouteResponse } from "@nyc-truck-gps/shared";

export function buildLocalFallbackRoute(payload: RouteRequest): RouteResponse {
  return buildTruckRouteResponse(payload);
}
