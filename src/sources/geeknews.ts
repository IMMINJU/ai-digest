import type { Article } from "./hackernews.js";

const FEED_URL = "http://feeds.feedburner.com/geeknews-feed";

const AI_KEYWORDS =
  /\b(ai|llm|gpt|claude|gemini|copilot|openai|anthropic|machine learning|deep learning|neural|transformer|diffusion|agent|rag|fine.?tun|embedding|vector|chatbot|generative|인공지능|생성형|거대언어모델)\b/i;

export async function fetchGeekNews(): Promise<Article[]> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "ai-digest-bot/1.0" },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);

    const articles: Article[] = [];

    for (const entry of entries) {
      const title = entry.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]>/)?.[1]
        ?? entry.match(/<title[^>]*>(.*?)<\/title>/)?.[1]
        ?? "";
      const url = entry.match(/<link[^>]*href='([^']*)'/)?.[1]
        ?? entry.match(/<link[^>]*href="([^"]*)"/)?.[1]
        ?? "";
      const content = entry.match(/<content[^>]*>(.*?)<\/content>/s)?.[1] ?? "";

      if (!AI_KEYWORDS.test(title) && !AI_KEYWORDS.test(content)) continue;

      articles.push({
        title,
        url,
        score: 0,
        source: "GeekNews",
      });
    }

    return articles.slice(0, 15);
  } catch {
    return [];
  }
}
