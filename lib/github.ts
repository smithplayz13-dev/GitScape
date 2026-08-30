import type { ContributionCalendar, ContributionDay, GitHubUser } from "@/types/github";
import { getLevelForCount } from "./colors";

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

type GhCalendarWeek = {
  contributionDays: { date: string; contributionCount: number; color: string }[];
};

export async function fetchGitHubContributions(
  token: string,
  username: string,
  year: number
): Promise<{ user: GitHubUser; calendar: ContributionCalendar }> {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        login
        name
        avatarUrl
        bio
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username, from, to } }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text.slice(0, 400)}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "GitHub GraphQL error");
  }

  const user = json.data?.user;
  if (!user) throw new Error("User not found");

  const weeksRaw: GhCalendarWeek[] = user.contributionsCollection.contributionCalendar.weeks;
  const totalContributions: number = user.contributionsCollection.contributionCalendar.totalContributions;

  // Flatten to compute max for level mapping
  const allCounts = weeksRaw.flatMap((w) => w.contributionDays.map((d) => d.contributionCount));
  const maxCount = Math.max(...allCounts, 1);

  const weeks = weeksRaw.map((w) => ({
    days: w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: getLevelForCount(d.contributionCount, maxCount),
    })),
  }));

  const days: ContributionDay[] = weeks.flatMap((w) => w.days);

  const calendar: ContributionCalendar = {
    totalContributions,
    weeks,
    days,
  };

  return {
    user: {
      login: user.login,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    },
    calendar,
  };
}

export async function fetchViewer(token: string): Promise<GitHubUser> {
  const query = `query { viewer { login name avatarUrl bio } }`;
  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub viewer error ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.viewer;
}
