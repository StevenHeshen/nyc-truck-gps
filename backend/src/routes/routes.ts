import { Router } from "express";
import { routeRequestSchema } from "../services/validation";
import { planTruckRoute } from "../services/routePlanner";
import { GeocodingError } from "../services/geocoding";

const router = Router();

router.post("/truck-safe", async (req, res) => {
  const parsed = routeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid route request",
      details: parsed.error.flatten()
    });
  }

  try {
    return res.json(await planTruckRoute(parsed.data));
  } catch (error) {
    if (error instanceof GeocodingError) {
      return res.status(422).json({
        error: "address_not_found",
        detail: error.message
      });
    }
    return res.status(502).json({
      error: "Truck routing service is unavailable",
      detail: error instanceof Error ? error.message : "Unknown routing error"
    });
  }
});

export default router;
