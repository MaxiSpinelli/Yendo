import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ url: null }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q") ?? "travel";
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    return NextResponse.json({ url: null }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
      {
        headers: { Authorization: `Client-ID ${apiKey}` },
        next: { revalidate: 86400 }, // cache 24hs por destino
      }
    );

    const data = await res.json();
    const url = data?.results?.[0]?.urls?.regular ?? null;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null });
  }
}