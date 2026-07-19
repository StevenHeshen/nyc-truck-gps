export type VehicleType =
  | "box_truck"
  | "semi"
  | "cargo_van"
  | "dump_truck"
  | "tractor_trailer";

export type RoadRestrictionType =
  | "truck_route"
  | "low_clearance"
  | "parkway"
  | "tunnel"
  | "bridge"
  | "construction";

export type Severity = "safe" | "warning" | "danger";

export type DataSourceKind = "demo" | "official" | "community";

export interface DataSourceMetadata {
  kind: DataSourceKind;
  name: string;
  url: string;
  updatedAt?: string;
}

export interface VehicleProfile {
  id: string;
  name: string;
  type: VehicleType;
  heightFt: number;
  heightIn: number;
  weightLbs: number;
  lengthFt: number;
  widthFt: number;
  axles: number;
  hasHazmat: boolean;
}

export interface RestrictionPoint {
  id: string;
  type: RoadRestrictionType;
  title: string;
  location: string;
  borough: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  note: string;
  clearanceFt?: number;
  clearanceIn?: number;
  maxWeightLbs?: number;
  commercialVehicleProhibited?: boolean;
  hazmatProhibited?: boolean;
  source: DataSourceMetadata;
}

export interface TruckRouteSegment {
  id: string;
  street: string;
  borough: string;
  routeType: "Local" | "Through" | "Unknown";
  regulation?: string;
  geometry: {
    type: "MultiLineString";
    coordinates: number[][][];
  };
  source: DataSourceMetadata;
}

export interface TruckRouteDatasetResponse {
  ok: true;
  count: number;
  cached: boolean;
  source: {
    datasetId: string;
    name: string;
    url: string;
    apiUrl: string;
  };
  routes: TruckRouteSegment[];
  disclaimer: string;
}

export interface AnalyzedRestriction extends RestrictionPoint {
  computedSeverity: Severity;
  reason: string;
}

export interface TruckRouteOption {
  id: "safe" | "balanced" | "fast";
  name: string;
  etaMinutes: number;
  distanceMiles: number;
  tollEstimateUsd: number;
  compliance: "High" | "Medium" | "Low";
  description: string;
  steps: string[];
  riskIds: string[];
  geometry: Array<{ latitude: number; longitude: number }>;
}

export interface RouteRequest {
  origin: string;
  destination: string;
  originCoordinate?: Coordinate;
  destinationCoordinate?: Coordinate;
  vehicle: VehicleProfile;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteResponse {
  origin: string;
  destination: string;
  vehicle: VehicleProfile;
  recommendedRouteId: TruckRouteOption["id"];
  routes: TruckRouteOption[];
  restrictions: AnalyzedRestriction[];
  summary: {
    safe: number;
    warning: number;
    danger: number;
  };
  disclaimer: string;
  routeProvider: "demo" | "valhalla";
  aiAdvisory?: string;
}

export interface DriverReport {
  id: string;
  type: string;
  location: string;
  note: string;
  latitude?: number;
  longitude?: number;
  status: "pending_review" | "verified" | "recent";
  votes: number;
  createdAt: string;
}
