import { Router } from "express";
import { createReportSchema } from "../services/validation";

const router = Router();

const reports = [
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

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    reports
  });
});

router.post("/", (req, res) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid report", details: parsed.error.flatten() });
  const newReport = {
    id: `report_${Date.now()}`,
    type: parsed.data.type,
    location: parsed.data.location,
    note: parsed.data.note,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    status: "pending_review",
    votes: 0,
    createdAt: new Date().toISOString()
  };

  reports.unshift(newReport);

  res.status(201).json({
    ok: true,
    report: newReport
  });
});

export default router;
