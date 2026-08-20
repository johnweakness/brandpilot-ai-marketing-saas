import { getUserSupabase, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json() as { contentType?: string; prompt?: string; tone?: string };
    if (!body.contentType || !body.prompt || !body.tone || body.prompt.length > 2000) return Response.json({ error: "Invalid generation request." }, { status: 400 });
    const db = getUserSupabase(request);
    if (!db) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0,0,0,0);
    const [{ count }, { data: subscription }, { data: brand }] = await Promise.all([
      db.from("generations").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", monthStart.toISOString()),
      db.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle(),
      db.from("brand_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    const pro = subscription?.status === "active" || subscription?.status === "trialing";
    if (!pro && (count ?? 0) >= 25) return Response.json({ error: "Monthly generation limit reached.", upgradeRequired: true }, { status: 402 });
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");
    const system = `You are BrandPilot, a senior marketing copywriter. Create ${body.contentType} copy. Tone: ${body.tone}. Brand: ${brand?.name ?? "the user's brand"}. Brand description: ${brand?.description ?? "Not provided"}. Audience: ${brand?.audience ?? "Not provided"}. Personality: ${brand?.personality ?? "Not provided"}. Avoid: ${brand?.avoid_words ?? "none"}. Return only final publish-ready copy. Use clean plain text with natural spacing. Do not use Markdown, asterisks, hash headings, formatting labels, or meta commentary.`;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const ai = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: body.prompt }] }], generationConfig: { maxOutputTokens: 900, temperature: 0.8 } }) });
    const payload = await ai.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!ai.ok) throw new Error(payload.error?.message || "Gemini generation failed. Please try again.");
    const output = payload.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!output) throw new Error("Gemini returned an empty response.");
    const cleanOutput = output.replace(/\*\*(.*?)\*\*/g, "$1").replace(/^#{1,6}\s+/gm, "").replace(/^\s*[-*]\s+/gm, "• ").trim();
    const { data, error } = await db.from("generations").insert({ user_id: user.id, title: body.prompt.slice(0, 70), content_type: body.contentType, prompt: body.prompt, tone: body.tone, content: cleanOutput }).select().single();
    if (error) throw error;
    return Response.json({ generation: data, remaining: pro ? null : Math.max(0, 24 - (count ?? 0)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Generation failed." }, { status: 500 });
  }
}
