import assert from "node:assert/strict";
import test from "node:test";
import { transformOfficialTruckRoute } from "../src/services/officialTruckRoutes";

test("converts an NYC Open Data feature into an attributed route segment", () => {
  const segment = transformOfficialTruckRoute({
    type: "Feature",
    geometry: { type: "MultiLineString", coordinates: [[[-73.9, 40.8], [-73.8, 40.9]]] },
    properties: {
      segmentid: "0073071",
      street: "JEROME AVENUE",
      boroname: "Bronx",
      routetype: "Local",
      nyc_reg: "NYCDOT Traffic Rules, Section 4-13-(f)(2)"
    }
  });

  assert.equal(segment?.id, "nycdot-0073071");
  assert.equal(segment?.routeType, "Local");
  assert.equal(segment?.source.kind, "official");
  assert.deepEqual(segment?.geometry.coordinates[0][0], [-73.9, 40.8]);
});

test("rejects unsupported or missing geometry", () => {
  assert.equal(transformOfficialTruckRoute({ properties: { segmentid: "1" } }), null);
});
