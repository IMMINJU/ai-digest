import Anthropic from "@anthropic-ai/sdk";
import type { Article } from "./sources/hackernews.js";

const client = new Anthropic();

export async function summarize(articles: Article[]): Promise<string> {
  if (articles.length === 0) return "오늘은 주목할 만한 AI 소식이 없습니다.";

  const input = articles
    .map((a, i) => `${i + 1}. [${a.source}] ${a.title} (${a.score}점)\n   ${a.url}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
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

포맷 규칙 (Google Chat 전용 — 반드시 지켜주세요):
- 마크다운(#, ##, **, [], - 등)은 절대 사용하지 마세요
- 볼드는 *텍스트* 형식으로 (별표 1개)
- 링크는 URL을 그대로 노출 (자동 링크됨)
- 구분선은 ━━━ (유니코드 굵은 선)
- 목록은 • 또는 숫자로
- 카테고리 구분은 이모지 + *카테고리명* 형태로

글 목록:
${input}`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "요약 생성 실패";
}
