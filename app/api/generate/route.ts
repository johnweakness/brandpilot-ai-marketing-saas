import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json() as { contentType?: string; prompt?: string; tone?: string };
    if (!body.contentType || !body.prompt || !body.tone || body.prompt.length > 2000) return Response.json({ error: "Invalid generation request." }, { status: 400 });
    const db = getSupabaseAdmin();
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0,0,0,0);
    const [{ count }, { data: subscription }, { data: brand }] = await Promise.all([
      db.from("generations").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", monthStart.toISOString()),
      db.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle(),
      db.from("brand_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    const pro = subscription?.status === "active" || subscription?.status === "trialing";
    if (!pro && (count ?? 0) >= 25) return Response.json({ error: "Monthly generation limit reached.", upgradeRequired: true }, { status: 402 });
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
    const system = `You are BrandPilot, a senior marketing copywriter. Create ${body.contentType} copy. Tone: ${body.tone}. Brand: ${brand?.name ?? "the user's brand"}. Brand description: ${brand?.description ?? "Not provided"}. Audience: ${brand?.audience ?? "Not provided"}. Personality: ${brand?.personality ?? "Not provided"}. Avoid: ${brand?.avoid_words ?? "none"}. Return only final publish-ready copy.`;
    const ai = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", instructions: system, input: body.prompt, max_output_tokens: 900 }) });
    if (!ai.ok) throw new Error("AI generation failed. Please try again.");
    const payload = await ai.json() as { output_text?: string };
    if (!payload.output_text) throw new Error("The AI returned an empty response.");
    const { data, error } = await db.from("generations").insert({ user_id: user.id, title: body.prompt.slice(0, 70), content_type: body.contentType, prompt: body.prompt, tone: body.tone, content: payload.output_text }).select().single();
    if (error) throw error;
    return Response.json({ generation: data, remaining: pro ? null : Math.max(0, 24 - (count ?? 0)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Generation failed." }, { status: 500 });
  }
}
