import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchGitHubContributions } from "@/lib/github";
import { generateMockCalendar } from "@/lib/mock";

export async function GET(req: NextRequest) {
  const yearParam = req.nextUrl.searchParams.get("year");
  const usernameParam = req.nextUrl.searchParams.get("username");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (isNaN(year) || year < 2008 || year > new Date().getFullYear() + 1) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("gitscape_token")?.value;

  // If we have a token, try real GitHub; otherwise return mock
  if (token) {
    try {
      // Need username: either query param or fetch viewer
      let username = usernameParam;
      if (!username) {
        // fetch viewer login
        const viewerRes = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: "query { viewer { login } }" }),
          cache: "no-store",
        });
        if (viewerRes.ok) {
          const j = await viewerRes.json();
          username = j.data?.viewer?.login;
        }
      }
      if (!username) {
        return NextResponse.json({ error: "Could not determine GitHub username" }, { status: 400 });
      }

      const data = await fetchGitHubContributions(token, username, year);
      return NextResponse.json({
        year,
        user: data.user,
        calendar: data.calendar,
        source: "github",
      });
    } catch (e: unknown) {
      // handle rate limit / auth errors explicitly
      const msg = e instanceof Error ? e.message : String(e);
      const isRateLimited = msg.includes("rate limit") || msg.includes("API rate limit");
      const isAuth = msg.includes("Bad credentials") || msg.includes("401");

      if (isRateLimited) {
        return NextResponse.json({ error: "GitHub API rate limit exceeded. Try again shortly.", details: msg }, { status: 429 });
      }
      if (isAuth) {
        return NextResponse.json({ error: "GitHub authentication failed. Please sign in again.", details: msg }, { status: 401 });
      }
      console.error("GitHub contributions error:", msg);
      return NextResponse.json({ error: "Failed to fetch contributions", details: msg }, { status: 500 });
    }
  }

  // No token — return mock (allows demo without auth) or fetch public user if username supplied
  if (usernameParam) {
    // Try unauthenticated? GitHub GraphQL requires auth, so fall back to mock but indicate demo
    // Optionally we could try REST scraping, but for MVP mock is fine.
  }

  const calendar = generateMockCalendar(year, 42);
  return NextResponse.json({
    year,
    user: null,
    calendar,
    source: "mock",
    demo: true,
  });
}
