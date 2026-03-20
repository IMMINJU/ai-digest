export interface Article {
  title: string;
  url: string;
  score: number;
  source: string;
}

const AI_KEYWORDS =
  /\b(ai|llm|gpt|claude|gemini|copilot|openai|anthropic|machine learning|deep learning|neural|transformer|diffusion|stable diffusion|midjourney|agent|rag|fine.?tun|embedding|vector|chatbot|generative)\b/i;

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      if (i === retries - 1) throw new Error(`Failed after ${retries} retries: ${url}`);
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error(`Failed: ${url}`);
}

async function fetchInBatches<T>(
  items: T[],
  fn: (item: T) => Promise<unknown>,
  batchSize = 10,
): Promise<unknown[]> {
  const results: unknown[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export async function fetchHackerNews(): Promise<Article[]> {
  const res = await fetchWithRetry(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const ids: number[] = await res.json();

  const items = await fetchInBatches(
    ids.slice(0, 60),
    async (id) => {
      try {
        const r = await fetchWithRetry(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return r.json();
      } catch {
        return null;
      }
    },
    10,
  );

  return items.filter(Boolean)
    .filter((item) => item?.title && AI_KEYWORDS.test(item.title))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 15)
    .map((item) => ({
      title: item.title,
      url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
      score: item.score ?? 0,
      source: "Hacker News",
    }));
}
