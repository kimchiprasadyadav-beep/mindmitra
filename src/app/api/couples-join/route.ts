import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, partnerName } = await req.json();
    if (!code || !partnerName) {
      return NextResponse.json({ error: "Missing code or name" }, { status: 400 });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .ilike("title", `%COUPLES:${code.toUpperCase()}%`)
      .limit(1);

    if (!convos || convos.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const convo = convos[0];
    const titleMatch = convo.title.match(/\[COUPLES:[A-Z0-9]+\] (.+) & (.+)/);
    const creatorName = titleMatch ? titleMatch[1] : "Partner";

    // Update title with partner name
    await supabase
      .from("conversations")
      .update({ title: `[COUPLES:${code.toUpperCase()}] ${creatorName} & ${partnerName}` })
      .eq("id", convo.id);

    // Load existing messages
    const { data: msgs } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      convoId: convo.id,
      creatorName,
      messages: msgs || [],
    });
  } catch (error: unknown) {
    console.error("Couples join error:", error);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
