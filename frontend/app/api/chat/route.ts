import { NextRequest } from "next/server";

// Force dynamic so Next.js never caches this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Directly fetch from the Express backend and pipe its ReadableStream
  // through unchanged — this preserves chunked / streaming behaviour.
  const upstream = await fetch("http://localhost:8080/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      // Tell nginx / any reverse-proxy not to buffer this response
      "X-Accel-Buffering": "no",
    },
  });
}
