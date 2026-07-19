import { Router } from "express";
import { buildTruckRouteResponse } from "@nyc-truck-gps/shared";
import { routeRequestSchema } from "../services/validation";

const router = Router();

router.post("/truck-safe", (req, res) => {
  const parsed = routeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid route request",
      details: parsed.error.flatten()
    });
  }

  return res.json(buildTruckRouteResponse(parsed.data));
});

export default router;
