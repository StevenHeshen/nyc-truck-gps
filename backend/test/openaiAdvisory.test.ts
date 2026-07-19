import assert from "node:assert/strict";
import test from "node:test";
import { buildTruckRouteResponse, RouteRequest } from "@nyc-truck-gps/shared";
import { createRouteAdvisory } from "../src/services/openaiAdvisory";

const request: RouteRequest = {
  origin: "Queens",
  destination: "Brooklyn",
  vehicle: {
    id: "truck-1", name: "Test truck", type: "box_truck", heightFt: 12, heightIn: 6,
    weightLbs: 26_000, lengthFt: 24, widthFt: 8, axles: 2, hasHazmat: false
  }
};

test("does not call OpenAI when no API key is configured", async () => {
  let called = false;
  const result = await createRouteAdvisory(request, buildTruckRouteResponse(request), {
    fetcher: async () => { called = true; return new Response(); }
  });
  assert.equal(result, undefined);
  assert.equal(called, false);
});

test("extracts advisory text without changing the deterministic response", async () => {
  const routeResponse = buildTruckRouteResponse(request);
  const originalGeometry = structuredClone(routeResponse.routes[0].geometry);
  const result = await createRouteAdvisory(request, routeResponse, {
    apiKey: "test-key",
    fetcher: async () => new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "Use the verified route and obey posted signs." }] }]
    }), { status: 200 })
  });
  assert.equal(result, "Use the verified route and obey posted signs.");
  assert.deepEqual(routeResponse.routes[0].geometry, originalGeometry);
});
