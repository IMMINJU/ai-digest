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
        `https://www.reddit.com/r/${sub}/hot.rss?limit=15`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ai-digest-bot/1.0)",
          },
        }
      );
      if (!res.ok) continue;

      const xml = await res.text();
      const entries = xml.split("<entry>").slice(1);

      for (const entry of entries) {
        const title =
          entry.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
        const url =
          entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ??
          entry.match(/<link[^>]*href="([^"]*)"/)?.[1] ??
          "";

        if (!title || !url) continue;

        results.push({
          title,
          url,
          score: 0,
          source: `r/${sub}`,
        });
      }
    } catch {
      // skip failed subreddit
    }
  }

  return results.slice(0, 15);
}
