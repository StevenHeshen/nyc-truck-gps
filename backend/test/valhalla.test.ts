import assert from "node:assert/strict";
import test from "node:test";
import { RouteRequest } from "@nyc-truck-gps/shared";
import { buildValhallaPayload, requestValhallaRoute } from "../src/services/valhalla";

const request: RouteRequest = {
  origin: "Flushing, Queens",
  destination: "Sunset Park, Brooklyn",
  originCoordinate: { latitude: 40.758, longitude: -73.831 },
  destinationCoordinate: { latitude: 40.652, longitude: -74.012 },
  vehicle: {
    id: "truck-1",
    name: "Box truck",
    type: "box_truck",
    heightFt: 12,
    heightIn: 6,
    weightLbs: 26_000,
    lengthFt: 24,
    widthFt: 8,
    axles: 2,
    hasHazmat: true
  }
};

test("maps the complete vehicle profile into Valhalla truck costing", () => {
  const payload = buildValhallaPayload(request);
  assert.equal(payload.costing, "truck");
  assert.deepEqual(payload.costing_options.truck, {
    height: 3.81,
    width: 2.438,
    length: 7.315,
    weight: 11.793,
    axle_count: 2,
    hazmat: true
  });
});

test("converts a Valhalla response into a mobile route", async () => {
  let submittedBody: unknown;
  const fetcher: typeof fetch = async (_input, init) => {
    submittedBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      trip: {
        summary: { length: 18.42, time: 2520 },
        legs: [{
          shape: "_gjaRv_~ycF_ibE_seK",
          maneuver: [{ instruction: "Start on the truck route." }]
        }]
      }
    }), { status: 200 });
  };

  const route = await requestValhallaRoute(request, "http://valhalla.test/", fetcher);
  assert.equal((submittedBody as { costing: string }).costing, "truck");
  assert.equal(route.etaMinutes, 42);
  assert.equal(route.distanceMiles, 18.4);
  assert.equal(route.steps[0], "Start on the truck route.");
  assert.equal(route.geometry.length, 2);
});
