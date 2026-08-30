import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get("gitscape_oauth_state")?.value;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=missing_code`);
  }

  if (state && storedState && state !== storedState) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=state_mismatch`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=oauth_not_configured`);
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      console.error("OAuth token exchange failed", t);
      return NextResponse.redirect(`${appUrl}/dashboard?error=token_exchange_failed`);
    }

    const data = await tokenRes.json();
    if (data.error || !data.access_token) {
      console.error("OAuth error", data);
      return NextResponse.redirect(`${appUrl}/dashboard?error=${data.error ?? "no_token"}`);
    }

    const accessToken: string = data.access_token;

    // Fetch viewer to get login for later use (optional)
    // Don't fail if this fails — we still set token

    const res = NextResponse.redirect(`${appUrl}/dashboard`);
    res.cookies.set("gitscape_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    res.cookies.delete("gitscape_oauth_state");
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${appUrl}/dashboard?error=callback_exception`);
  }
}
