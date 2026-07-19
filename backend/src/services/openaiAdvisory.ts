import { RouteRequest, RouteResponse } from "@nyc-truck-gps/shared";

interface OpenAIResponsePayload {
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
}

export async function createRouteAdvisory(
  request: RouteRequest,
  response: RouteResponse,
  options: { apiKey?: string; model?: string; fetcher?: typeof fetch } = {}
) {
  if (!options.apiKey) return undefined;
  const fetcher = options.fetcher ?? fetch;
  const apiResponse = await fetcher("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${options.apiKey}` },
    body: JSON.stringify({
      model: options.model ?? "gpt-5.6-sol",
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: 220,
      instructions: [
        "Explain a deterministic truck-route result to a commercial driver.",
        "Use only the supplied JSON. Never invent roads, restrictions, clearances, weights, tolls, or safety claims.",
        "State that posted signs and current agency rules override the result.",
        "The AI explanation must never modify or select the route geometry."
      ].join(" "),
      input: JSON.stringify({
        origin: request.origin,
        destination: request.destination,
        vehicle: request.vehicle,
        routeProvider: response.routeProvider,
        routes: response.routes.map(({ name, etaMinutes, distanceMiles, compliance, description }) => ({ name, etaMinutes, distanceMiles, compliance, description })),
        summary: response.summary
      })
    }),
    signal: AbortSignal.timeout(12_000)
  });
  if (!apiResponse.ok) throw new Error(`OpenAI returned ${apiResponse.status}`);
  const payload = (await apiResponse.json()) as OpenAIResponsePayload;
  return payload.output
    ?.flatMap((item) => item.type === "message" ? item.content ?? [] : [])
    .find((item) => item.type === "output_text")?.text;
}
