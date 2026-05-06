import { DriverReport, RestrictionPoint, TruckRouteOption } from "./types";

export const mockRestrictions: RestrictionPoint[] = [
  {
    id: "restriction_low_fdr_96",
    type: "low_clearance",
    title: "Low Clearance Bridge",
    location: "FDR Drive near E 96th St",
    borough: "Manhattan",
    latitude: 40.7855,
    longitude: -73.9349,
    clearanceFt: 10,
    clearanceIn: 6,
    severity: "danger",
    commercialVehicleProhibited: true,
    note: "Low-clearance and commercial vehicle risk. Avoid for box trucks and tractor trailers."
  },
  {
    id: "restriction_jackie_robinson",
    type: "parkway",
    title: "Parkway Restriction",
    location: "Jackie Robinson Parkway",
    borough: "Queens / Brooklyn",
    latitude: 40.6896,
    longitude: -73.8579,
    severity: "danger",
    commercialVehicleProhibited: true,
    note: "NYC parkways generally prohibit commercial vehicles."
  },
  {
    id: "restriction_holland_tunnel",
    type: "tunnel",
    title: "Tunnel Restriction Check",
    location: "Holland Tunnel",
    borough: "Manhattan / NJ",
    latitude: 40.7272,
    longitude: -74.0213,
    severity: "warning",
    hazmatProhibited: true,
    note: "Check vehicle type, cargo, height, and hazardous material restrictions before entering."
  },
  {
    id: "restriction_bruckner",
    type: "truck_route",
    title: "Preferred Truck Route",
    location: "Bruckner Blvd / Major Deegan corridor",
    borough: "Bronx",
    latitude: 40.8076,
    longitude: -73.9129,
    severity: "safe",
    note: "Route segment is commonly used by commercial vehicles."
  },
  {
    id: "restriction_brooklyn_bridge_weight",
    type: "bridge",
    title: "Bridge Weight Review",
    location: "Brooklyn Bridge approach",
    borough: "Manhattan / Brooklyn",
    latitude: 40.7061,
    longitude: -73.9969,
    maxWeightLbs: 24000,
    severity: "warning",
    note: "Vehicle weight may exceed preferred bridge threshold. Use truck route alternative."
  },
  {
    id: "restriction_atlantic_construction",
    type: "construction",
    title: "Reported Construction",
    location: "Atlantic Ave near 3rd Ave",
    borough: "Brooklyn",
    latitude: 40.6841,
    longitude: -73.9827,
    severity: "warning",
    note: "Community report: lane closure may make right turns difficult for box trucks."
  }
];

export const mockRoutes: TruckRouteOption[] = [
  {
    id: "safe",
    name: "Truck-safe route",
    etaMinutes: 42,
    distanceMiles: 18.4,
    tollEstimateUsd: 22.38,
    compliance: "High",
    description: "Uses truck-friendly corridors and avoids parkways and known low-clearance areas.",
    riskIds: [],
    steps: [
      "Start on a local street and connect to an approved truck route.",
      "Use major commercial corridors where truck traffic is allowed.",
      "Avoid parkways and low-clearance segments.",
      "Approach the destination using local truck routes."
    ],
    geometry: [
      { latitude: 40.758, longitude: -73.831 },
      { latitude: 40.729, longitude: -73.917 },
      { latitude: 40.704, longitude: -73.991 },
      { latitude: 40.652, longitude: -74.012 }
    ]
  },
  {
    id: "balanced",
    name: "Balanced route",
    etaMinutes: 37,
    distanceMiles: 17.2,
    tollEstimateUsd: 15.12,
    compliance: "Medium",
    description: "Shorter than the safest route, but includes one restriction that needs driver review.",
    riskIds: ["restriction_brooklyn_bridge_weight"],
    steps: [
      "Use a local truck route from origin.",
      "Cross via a major arterial.",
      "Review bridge weight and signage before crossing.",
      "Avoid final-mile residential shortcuts."
    ],
    geometry: [
      { latitude: 40.758, longitude: -73.831 },
      { latitude: 40.747, longitude: -73.942 },
      { latitude: 40.712, longitude: -74.003 },
      { latitude: 40.652, longitude: -74.012 }
    ]
  },
  {
    id: "fast",
    name: "Fastest car route",
    etaMinutes: 31,
    distanceMiles: 15.7,
    tollEstimateUsd: 11.19,
    compliance: "Low",
    description: "Faster, but may include parkway, tunnel, or low-clearance risks for trucks.",
    riskIds: ["restriction_low_fdr_96", "restriction_jackie_robinson", "restriction_holland_tunnel"],
    steps: [
      "Car-style shortcut detected.",
      "Possible parkway entrance risk.",
      "Possible low-clearance risk.",
      "Not recommended for commercial vehicles."
    ],
    geometry: [
      { latitude: 40.758, longitude: -73.831 },
      { latitude: 40.701, longitude: -73.885 },
      { latitude: 40.727, longitude: -74.021 },
      { latitude: 40.652, longitude: -74.012 }
    ]
  }
];

export const mockDriverReports: DriverReport[] = [
  {
    id: "report_101",
    type: "Low bridge sign",
    location: "Queens Blvd near service road",
    note: "New sign visible near the service road entrance.",
    status: "pending_review",
    votes: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: "report_102",
    type: "Hard right turn",
    location: "3rd Ave, Brooklyn",
    note: "Box truck turning is difficult because of cones and parked cars.",
    status: "verified",
    votes: 21,
    createdAt: new Date().toISOString()
  },
  {
    id: "report_103",
    type: "Police truck route check",
    location: "Canal St, Manhattan",
    note: "Drivers reported truck route enforcement nearby.",
    status: "recent",
    votes: 13,
    createdAt: new Date().toISOString()
  }
];
