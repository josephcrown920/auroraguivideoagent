import { createFileRoute } from "@tanstack/react-router";
import { runModelArkDirector } from "@/lib/modelark-director.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function authorized(request: Request) {
  const token = process.env.AURORA_MCP_TOKEN?.trim();
  if (!token) return false;
  return request.headers.get("authorization") === `Bearer ${token}`;
}

export const Route = createFileRoute("/api/modelark-director")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.AURORA_MCP_TOKEN?.trim()) return json({ error: "AURORA_MCP_TOKEN is not configured." }, 503);
        if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
        const body = await request.json().catch(() => ({})) as { instruction?: unknown; context?: Record<string, unknown> };
        if (typeof body.instruction !== "string" || !body.instruction.trim()) {
          return json({ error: "instruction is required" }, 400);
        }
        try {
          return json({ ok: true, role: "master_director", ...(await runModelArkDirector(body.instruction, body.context || {})) });
        } catch (error) {
          return json({ ok: false, error: error instanceof Error ? error.message : "ModelArk director failed" }, 502);
        }
      },
    },
  },
});
