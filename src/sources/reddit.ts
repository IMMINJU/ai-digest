import type { Article } from "./hackernews.js";

const SUBREDDITS = [
  "ChatGPT",
  "LocalLLaMA",
  "ClaudeAI",
  "AI_Agents",
  "singularity",
  "ArtificialIntelligence",
  "OpenAI",
];

export async function fetchReddit(): Promise<Article[]> {
  const results: Article[] = [];

  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(
        `https://old.reddit.com/r/${sub}/hot.json?limit=15`,
        {
          headers: {
            "User-Agent": "ai-digest-bot/1.0",
          },
        }
      );
      if (!res.ok) continue;

      const data = await res.json();
      const posts = data?.data?.children ?? [];

      for (const post of posts) {
        const d = post.data;
        if (d.stickied) continue;
        results.push({
          title: d.title,
          url: `https://reddit.com${d.permalink}`,
          score: d.score ?? 0,
          source: `r/${sub}`,
        });
      }
    } catch {
      // skip failed subreddit
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 15);
}
