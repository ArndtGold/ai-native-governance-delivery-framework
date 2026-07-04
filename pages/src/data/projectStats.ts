import { site } from "./site";

type GitHubRepo = {
  stargazers_count?: number;
};

type GitHubUser = {
  followers?: number;
};

type GitHubRepository = {
  stargazers_count?: number;
};

export type ProjectStat = {
  label: string;
  value: string;
  href: string;
};

const repoOwner = "ArndtGold";
const repoName = "ai-native-governance-delivery-framework";
const repoUrl = `https://github.com/${repoOwner}/${repoName}`;

function formatCount(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  if (value >= 1000) {
    const compact = value / 1000;
    return `${compact >= 10 ? compact.toFixed(0) : compact.toFixed(1)}K`;
  }
  return String(value);
}

function formatSocialCount(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1000) return "New";
  return formatCount(value);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "agdf-pages-build",
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchAuthorStars(): Promise<number | undefined> {
  let page = 1;
  let total = 0;
  let loaded = false;

  while (page <= 10) {
    const repos = await fetchJson<GitHubRepository[]>(
      `https://api.github.com/users/${repoOwner}/repos?per_page=100&page=${page}`,
    );

    if (!repos) break;
    loaded = true;
    if (repos.length === 0) break;
    total += repos.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0);
    if (repos.length < 100) break;
    page += 1;
  }

  return loaded ? total : undefined;
}

export async function getProjectStats(): Promise<ProjectStat[]> {
  const [repo, user, authorStars] = await Promise.all([
    fetchJson<GitHubRepo>(`https://api.github.com/repos/${repoOwner}/${repoName}`),
    fetchJson<GitHubUser>(`https://api.github.com/users/${repoOwner}`),
    fetchAuthorStars(),
  ]);

  return [
    {
      label: "Author stars",
      value: formatSocialCount(authorStars),
      href: `https://github.com/${repoOwner}?tab=repositories`,
    },
    {
      label: "Author followers",
      value: formatSocialCount(user?.followers),
      href: `https://github.com/${repoOwner}`,
    },
    {
      label: "Project release",
      value: `v${site.version}`,
      href: `${repoUrl}/releases`,
    },
    {
      label: "Project stars",
      value: formatSocialCount(repo?.stargazers_count),
      href: `${repoUrl}/stargazers`,
    },
  ];
}
