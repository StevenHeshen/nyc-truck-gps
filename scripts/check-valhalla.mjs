const baseUrl = process.env.VALHALLA_URL ?? "http://localhost:8002";

const status = await fetch(`${baseUrl}/status`, { signal: AbortSignal.timeout(10_000) });
if (!status.ok) throw new Error(`Valhalla status returned ${status.status}`);

const route = await fetch(`${baseUrl}/route`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    locations: [
      { lat: 40.758, lon: -73.831, type: "break" },
      { lat: 40.652, lon: -74.012, type: "break" }
    ],
    costing: "truck",
    costing_options: {
      truck: {
        height: 3.81,
        width: 2.438,
        length: 7.315,
        weight: 11.793,
        axle_count: 2,
        hazmat: false
      }
    },
    units: "miles"
  }),
  signal: AbortSignal.timeout(30_000)
});

if (!route.ok) throw new Error(`Valhalla route returned ${route.status}: ${await route.text()}`);
const payload = await route.json();
if (!payload.trip?.legs?.length || !payload.trip?.summary) throw new Error("Valhalla response is missing route data");

console.log(JSON.stringify({
  ok: true,
  service: baseUrl,
  distanceMiles: payload.trip.summary.length,
  etaMinutes: Math.round(payload.trip.summary.time / 60),
  legs: payload.trip.legs.length
}, null, 2));
