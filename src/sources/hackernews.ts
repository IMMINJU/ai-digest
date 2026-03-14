export interface Article {
  title: string;
  url: string;
  score: number;
  source: string;
}

const AI_KEYWORDS =
  /\b(ai|llm|gpt|claude|gemini|copilot|openai|anthropic|machine learning|deep learning|neural|transformer|diffusion|stable diffusion|midjourney|agent|rag|fine.?tun|embedding|vector|chatbot|generative)\b/i;

export async function fetchHackerNews(): Promise<Article[]> {
  const res = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const ids: number[] = await res.json();

  const items = await Promise.all(
    ids.slice(0, 60).map(async (id) => {
      const r = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return r.json();
    })
  );

  return items
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
