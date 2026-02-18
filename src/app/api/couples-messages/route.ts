import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get("conversationId");
    const after = url.searchParams.get("after"); // message count client already has

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    // If client tells us how many they have, only fetch newer ones
    if (after) {
      const offset = parseInt(after, 10);
      if (offset > 0) {
        query = query.range(offset, offset + 50);
      }
    }

    const { data: msgs } = await query;

    return NextResponse.json({ messages: msgs || [] });
  } catch (error: unknown) {
    console.error("Couples messages error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
