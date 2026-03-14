import type { Article } from "./hackernews.js";

const AI_KEYWORDS =
  /\b(ai|llm|gpt|claude|gemini|copilot|openai|anthropic|machine learning|agent|rag|chatbot|generative|automation)\b/i;

export async function fetchProductHunt(): Promise<Article[]> {
  try {
    const res = await fetch(
      "https://www.producthunt.com/frontend/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "ai-digest-bot/1.0",
        },
        body: JSON.stringify({
          query: `{
            posts(order: RANKING) {
              edges {
                node {
                  name
                  tagline
                  url
                  votesCount
                  topics { edges { node { name } } }
                }
              }
            }
          }`,
        }),
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const posts = data?.data?.posts?.edges ?? [];

    return posts
      .filter((edge: any) => {
        const node = edge.node;
        const topics = node.topics?.edges
          ?.map((t: any) => t.node.name)
          .join(" ") ?? "";
        return (
          AI_KEYWORDS.test(node.name) ||
          AI_KEYWORDS.test(node.tagline) ||
          AI_KEYWORDS.test(topics)
        );
      })
      .slice(0, 10)
      .map((edge: any) => ({
        title: `${edge.node.name} — ${edge.node.tagline}`,
        url: edge.node.url,
        score: edge.node.votesCount ?? 0,
        source: "Product Hunt",
      }));
  } catch {
    return [];
  }
}
