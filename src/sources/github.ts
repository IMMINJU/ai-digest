import type { Article } from "./hackernews.js";

const TRENDING_URL = "https://github.com/trending?since=daily";

const AI_KEYWORDS =
  /\b(ai|llm|gpt|claude|gemini|copilot|openai|anthropic|machine learning|deep learning|neural|transformer|diffusion|agent|rag|fine.?tun|embedding|vector|chatbot|generative|mcp|ollama|langchain|llama|mistral|qwen|deepseek|prompt)\b/i;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function fetchGitHubTrending(): Promise<Article[]> {
  try {
    const res = await fetch(TRENDING_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ai-digest-bot/1.0)",
      },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const entries = html.split('<article class="Box-row">').slice(1);

    const articles: Article[] = [];

    for (const entry of entries) {
      const hrefMatch = entry.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="(\/[^"]+)"/);
      if (!hrefMatch) continue;
      const path = hrefMatch[1];

      const ownerMatch = entry.match(/<span[^>]*class="text-normal"[^>]*>\s*([^<\/]+?)\s*\/\s*<\/span>/);
      const owner = ownerMatch?.[1]?.trim() ?? "";
      const repo = path.split("/").pop() ?? "";
      const title = owner && repo ? `${owner}/${repo}` : path.replace(/^\//, "");

      const descMatch = entry.match(/<p[^>]*class="col-9[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/p>/);
      const description = descMatch ? decodeEntities(descMatch[1].replace(/\s+/g, " ").trim()) : "";

      const starsMatch = entry.match(/([\d,]+)\s*stars today/);
      const score = starsMatch ? parseInt(starsMatch[1].replace(/,/g, ""), 10) : 0;

      const haystack = `${title} ${description}`;
      if (!AI_KEYWORDS.test(haystack)) continue;

      articles.push({
        title: description ? `${title} — ${description}` : title,
        url: `https://github.com${path}`,
        score,
        source: "GitHub Trending",
      });
    }

    return articles
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}
