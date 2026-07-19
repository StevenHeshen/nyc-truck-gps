import { API_BASE_URL } from "../config";
import { DriverReport, RouteRequest, RouteResponse, TruckRouteDatasetResponse } from "@nyc-truck-gps/shared";

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export function fetchTruckRoute(payload: RouteRequest): Promise<RouteResponse> {
  return requestJson<RouteResponse>("/api/routes/truck-safe", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchReports(): Promise<{ reports: DriverReport[] }> {
  return requestJson<{ reports: DriverReport[] }>("/api/reports");
}

export function createReport(payload: Pick<DriverReport, "type" | "location" | "note">): Promise<{ report: DriverReport }> {
  return requestJson<{ report: DriverReport }>("/api/reports", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchOfficialTruckRoutes(bounds: { north: number; west: number; south: number; east: number }) {
  const params = new URLSearchParams({
    north: String(bounds.north),
    west: String(bounds.west),
    south: String(bounds.south),
    east: String(bounds.east),
    limit: "2000"
  });
  return requestJson<TruckRouteDatasetResponse>(`/api/restrictions/truck-routes?${params}`);
}
