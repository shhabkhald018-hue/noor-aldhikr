// Noor AlDhikr V92.1 — trusted retrieval compatibility endpoint.
// The production assistant reads only reviewed, published knowledge in the
// browser. No model, paid provider, secret, or outbound request is used.

const ALLOWED_ORIGINS = new Set([
  "https://shhabkhald018-hue.github.io",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:5500",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5500",
]);

const FALLBACK_MESSAGE =
  "لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.";

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://shhabkhald018-hue.github.io",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return json(req, { ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const origin = req.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json(req, { ok: false, error: "ORIGIN_NOT_ALLOWED" }, 403);
  }

  let body: { question?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(req, { ok: false, error: "INVALID_JSON" }, 400);
  }

  const question = String(body?.question || "").trim();
  if (!question) {
    return json(req, { ok: false, error: "QUESTION_REQUIRED" }, 400);
  }
  if (question.length > 3000) {
    return json(req, { ok: false, error: "QUESTION_TOO_LONG", max: 3000 }, 400);
  }

  // HTTP 200 lets legacy callers take their existing local-RAG fallback path.
  return json(req, {
    ok: false,
    error: "LOCAL_AI_ONLY",
    answer: "",
    sources: [],
    trustedSourceCount: 0,
    confidence: 0,
    researchMode: "trusted-retrieval-only",
    fallbackRecommended: true,
    note: FALLBACK_MESSAGE,
  });
});
