import express from "express";
import cors from "cors";

import routesRouter from "./routes/routes";
import restrictionsRouter from "./routes/restrictions";
import reportsRouter from "./routes/reports";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "nyc-truck-gps-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/routes", routesRouter);
app.use("/api/restrictions", restrictionsRouter);
app.use("/api/reports", reportsRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NYC Truck GPS backend running on http://localhost:${PORT}`);
});
