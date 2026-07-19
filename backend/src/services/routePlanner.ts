import { buildTruckRouteResponse, RouteRequest, RouteResponse } from "@nyc-truck-gps/shared";
import { geocodeNycAddress } from "./geocoding";
import { createRouteAdvisory } from "./openaiAdvisory";
import { requestValhallaRoute } from "./valhalla";

export async function planTruckRoute(request: RouteRequest): Promise<RouteResponse> {
  const base = buildTruckRouteResponse(request);
  const valhallaUrl = process.env.VALHALLA_URL;
  let routedRequest = request;

  if (valhallaUrl && !request.originCoordinate && !request.destinationCoordinate) {
    const [originCoordinate, destinationCoordinate] = await Promise.all([
      geocodeNycAddress(request.origin),
      geocodeNycAddress(request.destination)
    ]);
    routedRequest = { ...request, originCoordinate, destinationCoordinate };
  }

  if (valhallaUrl && routedRequest.originCoordinate && routedRequest.destinationCoordinate) {
    const route = await requestValhallaRoute(routedRequest, valhallaUrl);
    base.routes = [route];
    base.recommendedRouteId = route.id;
    base.routeProvider = "valhalla";
    // Demo restriction points are not corridor-matched and must not be presented
    // as findings on a real route.
    base.restrictions = [];
    base.summary = { safe: 0, warning: 0, danger: 0 };
    base.disclaimer = "Route geometry was calculated by Valhalla from supplied vehicle parameters. Restriction records are not yet corridor-matched. Always follow posted signs and current agency rules.";
  }

  try {
    base.aiAdvisory = await createRouteAdvisory(routedRequest, base, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL
    });
  } catch (error) {
    console.warn("OpenAI route advisory unavailable", error instanceof Error ? error.message : error);
  }

  return base;
}
