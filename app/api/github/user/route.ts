import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchViewer } from "@/lib/github";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gitscape_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  try {
    const user = await fetchViewer(token);
    return NextResponse.json({ authenticated: true, user });
  } catch (e: unknown) {
    return NextResponse.json(
      { authenticated: false, error: e instanceof Error ? e.message : "Failed to fetch user" },
      { status: 401 }
    );
  }
}
