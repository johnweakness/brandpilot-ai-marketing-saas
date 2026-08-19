import { getSupabaseAdmin } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin().from("brand_profiles").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load brand." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;
    if (!body.name || !body.description) return Response.json({ error: "Brand name and description are required." }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: existing, error: readError } = await supabase.from("brand_profiles").select("id").limit(1).maybeSingle();
    if (readError) throw readError;
    const values = { name: body.name, website: body.website, description: body.description, audience: body.audience, personality: body.personality, avoid_words: body.avoidWords, updated_at: new Date().toISOString() };
    const query = existing ? supabase.from("brand_profiles").update(values).eq("id", existing.id) : supabase.from("brand_profiles").insert(values);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save brand." }, { status: 503 });
  }
}
