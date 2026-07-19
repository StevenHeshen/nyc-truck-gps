import assert from "node:assert/strict";
import test from "node:test";
import { GeocodingError, geocodeNycAddress } from "../src/services/geocoding";

function responseWith(longitude: number, latitude: number) {
  return new Response(JSON.stringify({
    result: { addressMatches: [{ matchedAddress: "41 SEAVER WAY, FLUSHING, NY, 11368", coordinates: { x: longitude, y: latitude } }] }
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

test("geocodes a full NYC street address with the Census API contract", async () => {
  let requestedUrl = "";
  const coordinate = await geocodeNycAddress("41 Seaver Way, Queens, NY 11368", {
    fetchImpl: async (input) => {
      requestedUrl = String(input);
      return responseWith(-73.8458, 40.7564);
    }
  });
  assert.deepEqual(coordinate, { latitude: 40.7564, longitude: -73.8458 });
  assert.match(requestedUrl, /benchmark=Public_AR_Current/);
  assert.match(requestedUrl, /format=json/);
});

test("rejects matches outside New York City", async () => {
  await assert.rejects(
    geocodeNycAddress("Albany address", { fetchImpl: async () => responseWith(-73.7562, 42.6526) }),
    GeocodingError
  );
});
