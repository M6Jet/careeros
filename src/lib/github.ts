// GitHub integration — uses the user's OAuth token when connected via SSO,
// falls back to unauthenticated public API.
export async function fetchGithubStats(username: string, token?: string | null) {
  const h: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const [user, repos, events] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers: h }).then(r => r.json()),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers: h }).then(r => r.json()),
    fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers: h }).then(r => r.json()).catch(() => []),
  ]);
  const languages: Record<string, number> = {};
  let stars = 0;
  for (const r of repos) { if (r.language) languages[r.language] = (languages[r.language] ?? 0) + 1; stars += r.stargazers_count; }
  let commits = 0, prs = 0;
  const pushDays: Record<string, number> = {};
  for (const e of Array.isArray(events) ? events : []) {
    const d = e.created_at?.slice(0, 10);
    if (e.type === "PushEvent") { commits += e.payload?.commits?.length ?? 1; pushDays[d] = (pushDays[d] ?? 0) + 1; }
    if (e.type === "PullRequestEvent") prs++;
  }
  return {
    name: user.name ?? username, publicRepos: user.public_repos, followers: user.followers,
    stars, languages, commits, prs, pushDays,
    repos: repos.filter((r: any) => !r.fork).map((r: any) => ({
      name: r.name, description: r.description, language: r.language,
      stars: r.stargazers_count, url: r.html_url, pushed: r.pushed_at,
    })).slice(0, 30),
  };
}

export async function reviewRepoStructure(username: string, repo: string, token?: string | null) {
  const h: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const files: string[] = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/`, { headers: h })
    .then(r => (r.ok ? r.json() : [])).then(a => a.map((f: any) => f.name)).catch(() => []);
  const has = (re: RegExp) => files.some(f => re.test(f));
  return [
    { ok: has(/^readme/i), advice: "README — first thing reviewers see" },
    { ok: has(/license/i), advice: "LICENSE file for open-source credibility" },
    { ok: has(/test|spec/i), advice: "Tests — even a few signal professionalism" },
    { ok: has(/\.github|workflows/), advice: "CI (GitHub Actions: lint + test)" },
    { ok: has(/dockerfile/i), advice: "Dockerfile for reproducible setup" },
    { ok: !has(/^\.env$/), advice: "No committed .env (secret hygiene)" },
  ];
}
