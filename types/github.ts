export type ContributionDay = {
  date: string; // YYYY-MM-DD
  count: number;
  level: number; // 0-4 intensity
};

export type ContributionWeek = {
  days: ContributionDay[];
};

export type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
  days: ContributionDay[]; // flattened
};

export type GitHubUser = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
};

export type Stats = {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  mostProductiveDay: ContributionDay | null;
  mostProductiveMonth: { month: string; count: number } | null;
};

export type ContributionsResponse = {
  user: GitHubUser | null;
  calendar: ContributionCalendar;
  year: number;
};

export type WorldMode = "city" | "terrain" | "galaxy";
