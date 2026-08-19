import { getSupabaseAdmin } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin().from("generations").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return Response.json((data ?? []).map(row => ({ id: row.id, title: row.title, contentType: row.content_type, prompt: row.prompt, tone: row.tone, content: row.content, status: row.status, createdAt: row.created_at })));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load content." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;
    if (!body.title || !body.contentType || !body.prompt || !body.tone || !body.content) return Response.json({ error: "Missing required fields." }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from("generations").insert({ title: body.title, content_type: body.contentType, prompt: body.prompt, tone: body.tone, content: body.content }).select().single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save content." }, { status: 503 });
  }
}
