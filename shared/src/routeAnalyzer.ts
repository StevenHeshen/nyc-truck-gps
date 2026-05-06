import {
  AnalyzedRestriction,
  RestrictionPoint,
  RouteRequest,
  RouteResponse,
  Severity,
  VehicleProfile
} from "./types";
import { mockRestrictions, mockRoutes } from "./mockData";

export function vehicleHeightInches(vehicle: VehicleProfile): number {
  return vehicle.heightFt * 12 + vehicle.heightIn;
}

function formatHeight(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}\"`;
}

export function analyzeRestriction(vehicle: VehicleProfile, restriction: RestrictionPoint): AnalyzedRestriction {
  const heightInches = vehicleHeightInches(vehicle);

  if (restriction.type === "low_clearance" && restriction.clearanceFt !== undefined) {
    const clearance = restriction.clearanceFt * 12 + (restriction.clearanceIn ?? 0);
    if (heightInches >= clearance) {
      return {
        ...restriction,
        computedSeverity: "danger",
        reason: `Your truck height ${formatHeight(heightInches)} is at or above the clearance ${formatHeight(clearance)}.`
      };
    }
    return {
      ...restriction,
      computedSeverity: "safe",
      reason: `Your truck height ${formatHeight(heightInches)} is below the clearance ${formatHeight(clearance)}.`
    };
  }

  if (restriction.type === "bridge" && restriction.maxWeightLbs !== undefined) {
    if (vehicle.weightLbs > restriction.maxWeightLbs) {
      return {
        ...restriction,
        computedSeverity: "danger",
        reason: `Your GVW ${vehicle.weightLbs.toLocaleString()} lb exceeds ${restriction.maxWeightLbs.toLocaleString()} lb.`
      };
    }
    return {
      ...restriction,
      computedSeverity: "safe",
      reason: `Your GVW is within this mock threshold.`
    };
  }

  if (restriction.type === "tunnel" && restriction.hazmatProhibited && vehicle.hasHazmat) {
    return {
      ...restriction,
      computedSeverity: "danger",
      reason: "Hazmat is marked as prohibited for this mock tunnel restriction."
    };
  }

  if (restriction.commercialVehicleProhibited && vehicle.type !== "cargo_van") {
    return {
      ...restriction,
      computedSeverity: "danger",
      reason: "Commercial vehicle restriction applies to this road segment."
    };
  }

  return {
    ...restriction,
    computedSeverity: restriction.severity as Severity,
    reason: "No vehicle-specific conflict found in mock analysis."
  };
}

export function buildTruckRouteResponse(request: RouteRequest): RouteResponse {
  const restrictions = mockRestrictions.map((restriction) => analyzeRestriction(request.vehicle, restriction));

  const summary = restrictions.reduce(
    (acc, item) => {
      acc[item.computedSeverity] += 1;
      return acc;
    },
    { safe: 0, warning: 0, danger: 0 }
  );

  const routes = mockRoutes.map((route) => {
    const riskSeverityScore = route.riskIds.reduce((score, riskId) => {
      const risk = restrictions.find((item) => item.id === riskId);
      if (!risk) return score;
      if (risk.computedSeverity === "danger") return score + 10;
      if (risk.computedSeverity === "warning") return score + 3;
      return score;
    }, 0);

    return {
      ...route,
      compliance:
        route.id === "safe" || riskSeverityScore === 0
          ? "High"
          : riskSeverityScore >= 10
          ? "Low"
          : "Medium"
    } as typeof route;
  });

  const recommendedRouteId = "safe";

  return {
    origin: request.origin,
    destination: request.destination,
    vehicle: request.vehicle,
    recommendedRouteId,
    routes,
    restrictions,
    summary,
    disclaimer:
      "Routes and restrictions are for planning assistance only. Drivers must follow posted signs and official agency rules."
  };
}
