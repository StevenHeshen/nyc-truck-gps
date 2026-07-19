import { API_BASE_URL } from "../config";
import { DriverReport, RouteRequest, RouteResponse, TruckRouteDatasetResponse } from "@nyc-truck-gps/shared";

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    let code: string | undefined;
    let detail = text;
    try {
      const payload = JSON.parse(text) as { error?: string; detail?: string };
      code = payload.error;
      detail = payload.detail ?? payload.error ?? text;
    } catch {
      // Preserve non-JSON server responses for diagnostics.
    }
    throw new ApiError(response.status, code, detail);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string | undefined, message: string) {
    super(message);
    this.name = "ApiError";
  }
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
