import { Router } from "express";

const router = Router();

const restrictions = [
  {
    id: "restriction_1",
    type: "low_clearance",
    title: "Low Clearance Bridge",
    location: "FDR Drive near E 96th St",
    borough: "Manhattan",
    clearanceFt: 10,
    clearanceIn: 6,
    severity: "danger",
    note: "Commercial vehicles should avoid this area."
  },
  {
    id: "restriction_2",
    type: "parkway",
    title: "Parkway Restriction",
    location: "Jackie Robinson Parkway",
    borough: "Queens / Brooklyn",
    severity: "danger",
    note: "NYC parkways generally prohibit commercial vehicles."
  },
  {
    id: "restriction_3",
    type: "tunnel",
    title: "Tunnel Restriction Check",
    location: "Holland Tunnel",
    borough: "Manhattan / NJ",
    severity: "warning",
    note: "Check vehicle type, cargo, height, and hazardous material restrictions before entering."
  },
  {
    id: "restriction_4",
    type: "truck_route",
    title: "Preferred Truck Route",
    location: "Bruckner Blvd / Major Deegan corridor",
    borough: "Bronx",
    severity: "safe",
    note: "Route segment is commonly used by commercial vehicles."
  },
  {
    id: "restriction_5",
    type: "bridge",
    title: "Bridge Weight Review",
    location: "Brooklyn Bridge approach",
    borough: "Manhattan / Brooklyn",
    maxWeightLbs: 24000,
    severity: "warning",
    note: "Vehicle weight may exceed preferred bridge threshold."
  },
  {
    id: "restriction_6",
    type: "construction",
    title: "Reported Construction",
    location: "Atlantic Ave near 3rd Ave",
    borough: "Brooklyn",
    severity: "warning",
    note: "Community report: lane closure may make right turns difficult."
  }
];

router.get("/", (req, res) => {
  const type = req.query.type as string | undefined;
  const borough = req.query.borough as string | undefined;

  let result = restrictions;

  if (type) {
    result = result.filter((item) => item.type === type);
  }

  if (borough) {
    result = result.filter((item) =>
      item.borough.toLowerCase().includes(borough.toLowerCase())
    );
  }

  res.json({
    ok: true,
    count: result.length,
    restrictions: result
  });
});

export default router;
