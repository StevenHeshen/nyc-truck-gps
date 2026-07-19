import { Router } from "express";
import { mockRestrictions } from "@nyc-truck-gps/shared";
import { fetchOfficialTruckRoutes, officialTruckRouteSource } from "../services/officialTruckRoutes";

const router = Router();

router.get("/truck-routes", async (req, res) => {
  const requestedLimit = Number(req.query.limit ?? 500);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 2_000) : 500;
  const borough = typeof req.query.borough === "string" ? req.query.borough : undefined;
  const bounds = parseBounds(req.query);
  if (bounds === null) return res.status(400).json({ ok: false, error: "Invalid map bounds" });

  try {
    const result = await fetchOfficialTruckRoutes({ borough, bounds, limit });
    return res.json({
      ok: true,
      count: result.segments.length,
      cached: result.cached,
      source: officialTruckRouteSource,
      routes: result.segments,
      disclaimer: "Official truck-route centerlines are reference data, not a turn-by-turn route. Always follow posted signs and current traffic rules."
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "Official truck-route data is temporarily unavailable",
      source: officialTruckRouteSource,
      detail: error instanceof Error ? error.message : "Unknown upstream error"
    });
  }
});

router.get("/", (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const borough = typeof req.query.borough === "string" ? req.query.borough : undefined;
  let result = mockRestrictions;

  if (type) result = result.filter((item) => item.type === type);
  if (borough) result = result.filter((item) => item.borough.toLowerCase().includes(borough.toLowerCase()));

  res.json({ ok: true, count: result.length, restrictions: result });
});

export default router;

function parseBounds(query: Record<string, unknown>) {
  const keys = ["north", "west", "south", "east"] as const;
  const supplied = keys.filter((key) => query[key] !== undefined);
  if (supplied.length === 0) return undefined;
  if (supplied.length !== keys.length) return null;

  const values = Object.fromEntries(keys.map((key) => [key, Number(query[key])])) as Record<(typeof keys)[number], number>;
  if (keys.some((key) => !Number.isFinite(values[key]))) return null;
  if (values.north <= values.south || values.east <= values.west) return null;
  if (values.north > 90 || values.south < -90 || values.east > 180 || values.west < -180) return null;
  return values;
}
