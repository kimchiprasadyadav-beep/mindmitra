import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { conversationId, role, content } = await req.json();
    if (!conversationId || !role || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from("messages").insert({ conversation_id: conversationId, role, content });
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Couples message error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
