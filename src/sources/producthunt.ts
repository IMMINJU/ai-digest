import type { Article } from "./hackernews.js";

const FEED_URL = "https://www.producthunt.com/feed";

const AI_KEYWORDS =
  /\b(ai|llm|gpt|claude|gemini|copilot|openai|anthropic|machine learning|agent|rag|chatbot|generative|automation)\b/i;

export async function fetchProductHunt(): Promise<Article[]> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "ai-digest-bot/1.0" },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);

    const articles: Article[] = [];

    for (const entry of entries) {
      const title =
        entry.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]>/)?.[1] ??
        entry.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ??
        "";
      const url =
        entry.match(/<link[^>]*href="([^"]*)"[^>]*rel="alternate"/)?.[1] ??
        entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]*)"/)?.[1] ??
        "";
      const content = entry.match(/<content[^>]*>(.*?)<\/content>/s)?.[1] ?? "";

      if (!AI_KEYWORDS.test(title) && !AI_KEYWORDS.test(content)) continue;

      articles.push({
        title,
        url,
        score: 0,
        source: "Product Hunt",
      });
    }

    return articles.slice(0, 10);
  } catch {
    return [];
  }
}
