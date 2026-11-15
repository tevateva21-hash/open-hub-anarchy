import { NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      tablesReady: false,
      message:
        "Variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY absentes.",
    });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({
      configured: false,
      tablesReady: false,
      message: "Client Supabase non initialisé.",
    });
  }

  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (error) {
    return NextResponse.json({
      configured: true,
      tablesReady: false,
      message:
        "Supabase est connecté, mais les tables SQL (schema.sql) n'ont pas encore été exécutées dans Supabase -> SQL Editor.",
      error: error.message,
    });
  }

  return NextResponse.json({
    configured: true,
    tablesReady: true,
    message: "Supabase connecté et tables prêtes.",
  });
}
