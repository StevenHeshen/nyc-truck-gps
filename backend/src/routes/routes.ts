import { Router } from "express";

const router = Router();

function feetInchesToInches(feet: number, inches: number) {
  return feet * 12 + inches;
}

function analyzeRisks(vehicle: any) {
  const heightInches = Number(vehicle?.heightInches || 150);
  const weightLbs = Number(vehicle?.weightLbs || 26000);
  const hasHazmat = Boolean(vehicle?.hasHazmat || false);

  const risks = [];

  const lowBridgeClearance = feetInchesToInches(10, 6);

  if (heightInches >= lowBridgeClearance) {
    risks.push({
      id: "risk_low_bridge_1",
      type: "low_clearance",
      severity: "danger",
      title: "Low Clearance Bridge",
      location: "FDR Drive near E 96th St",
      message: "Your truck may be too tall for this low-clearance area."
    });
  }

  risks.push({
    id: "risk_parkway_1",
    type: "parkway",
    severity: "danger",
    title: "Parkway Restriction",
    location: "Jackie Robinson Parkway",
    message: "Commercial vehicles should avoid NYC parkways."
  });

  if (weightLbs > 24000) {
    risks.push({
      id: "risk_bridge_weight_1",
      type: "bridge",
      severity: "warning",
      title: "Bridge Weight Review",
      location: "Brooklyn Bridge approach",
      message: "Vehicle weight may exceed preferred bridge threshold."
    });
  }

  if (hasHazmat) {
    risks.push({
      id: "risk_tunnel_hazmat_1",
      type: "tunnel",
      severity: "danger",
      title: "Hazmat Tunnel Restriction",
      location: "Holland Tunnel",
      message: "Hazmat cargo may be restricted in tunnels."
    });
  } else {
    risks.push({
      id: "risk_tunnel_review_1",
      type: "tunnel",
      severity: "warning",
      title: "Tunnel Restriction Check",
      location: "Holland Tunnel",
      message: "Check vehicle type, cargo, height, and hazardous material restrictions before entering."
    });
  }

  return risks;
}

router.post("/truck-safe", (req, res) => {
  const { origin, destination, vehicle } = req.body;

  const risks = analyzeRisks(vehicle);
  const dangerCount = risks.filter((risk) => risk.severity === "danger").length;
  const warningCount = risks.filter((risk) => risk.severity === "warning").length;

  const routes = [
    {
      id: "safe",
      name: "Truck-safe route",
      etaMinutes: 42,
      distanceMiles: 18.4,
      tollEstimate: "$22.38",
      compliance: "High",
      riskCount: 0,
      risks: [],
      steps: [
        "Start on local street and connect to approved truck route",
        "Use major truck-friendly corridors where allowed",
        "Avoid parkways and known low-clearance areas",
        "Approach destination using local truck route"
      ]
    },
    {
      id: "balanced",
      name: "Balanced route",
      etaMinutes: 37,
      distanceMiles: 17.2,
      tollEstimate: "$15.12",
      compliance: "Medium",
      riskCount: Math.min(1, risks.length),
      risks: risks.slice(0, 1),
      steps: [
        "Use local truck route from origin",
        "Cross via major arterial",
        "Review bridge weight and signage before crossing",
        "Avoid final-mile residential shortcuts"
      ]
    },
    {
      id: "fast",
      name: "Fastest car route",
      etaMinutes: 31,
      distanceMiles: 15.7,
      tollEstimate: "$11.19",
      compliance: "Low",
      riskCount: risks.length,
      risks,
      steps: [
        "Car-style shortcut detected",
        "Possible parkway entrance risk",
        "Possible low-clearance risk",
        "Not recommended for commercial vehicles"
      ]
    }
  ];

  res.json({
    ok: true,
    origin: origin || "Unknown origin",
    destination: destination || "Unknown destination",
    recommendedRouteId: "safe",
    summary: {
      dangerCount,
      warningCount,
      totalRiskCount: risks.length
    },
    routes
  });
});

export default router;
