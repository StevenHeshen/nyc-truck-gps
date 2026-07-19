import assert from "node:assert/strict";
import test from "node:test";
import { analyzeRestriction, type RestrictionPoint, type VehicleProfile } from "@nyc-truck-gps/shared";

const vehicle: VehicleProfile = {
  id: "test-truck",
  name: "Test truck",
  type: "box_truck",
  heightFt: 10,
  heightIn: 0,
  weightLbs: 20_000,
  lengthFt: 24,
  widthFt: 8,
  axles: 2,
  hasHazmat: false
};

function restriction(overrides: Partial<RestrictionPoint>): RestrictionPoint {
  return {
    id: "test-restriction",
    type: "low_clearance",
    title: "Test restriction",
    location: "Test location",
    borough: "Queens",
    latitude: 40.7,
    longitude: -73.9,
    severity: "warning",
    note: "Test data",
    source: { kind: "demo", name: "Test", url: "https://example.com" },
    ...overrides
  };
}

test("flags a truck that meets a low-clearance threshold", () => {
  const result = analyzeRestriction(
    { ...vehicle, heightFt: 10, heightIn: 6 },
    restriction({ clearanceFt: 10, clearanceIn: 6 })
  );
  assert.equal(result.computedSeverity, "danger");
});

test("commercial prohibition takes precedence even when height clears", () => {
  const result = analyzeRestriction(
    vehicle,
    restriction({ clearanceFt: 12, commercialVehicleProhibited: true })
  );
  assert.equal(result.computedSeverity, "danger");
  assert.match(result.reason, /Commercial vehicle restriction/);
});

test("flags overweight vehicles", () => {
  const result = analyzeRestriction(
    { ...vehicle, weightLbs: 30_000 },
    restriction({ type: "bridge", maxWeightLbs: 24_000 })
  );
  assert.equal(result.computedSeverity, "danger");
});

test("flags hazmat vehicles when tunnel data prohibits hazmat", () => {
  const result = analyzeRestriction(
    { ...vehicle, hasHazmat: true },
    restriction({ type: "tunnel", hazmatProhibited: true })
  );
  assert.equal(result.computedSeverity, "danger");
});
