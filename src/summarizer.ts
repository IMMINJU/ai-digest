import Anthropic from "@anthropic-ai/sdk";
import type { Article } from "./sources/hackernews.js";

const client = new Anthropic();

export async function summarize(articles: Article[]): Promise<string> {
  if (articles.length === 0) return "오늘은 주목할 만한 AI 소식이 없습니다.";

  const input = articles
    .map((a, i) => `${i + 1}. [${a.source}] ${a.title} (${a.score}점)\n   ${a.url}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `아래는 오늘 수집된 AI 관련 인기 글 목록입니다. 이것을 한국어로 정리해주세요.

규칙:
- AI와 무관하거나 중복되는 글은 제거
- 비슷한 주제끼리 묶어서 3~5개 카테고리로 분류
- 각 글을 1줄로 요약 (원문 링크 포함)
- 전체적인 오늘의 트렌드를 2~3문장으로 서두에 작성
- Google Chat 메시지 포맷 (마크다운 사용 가능)

글 목록:
${input}`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "요약 생성 실패";
}
