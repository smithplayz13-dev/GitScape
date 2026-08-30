import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("gitscape_token");
  // Also support GET for simple link
  return res;
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const res = NextResponse.redirect(`${appUrl}/`);
  res.cookies.delete("gitscape_token");
  return res;
}
