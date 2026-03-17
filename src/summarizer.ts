import Anthropic from "@anthropic-ai/sdk";
import type { Article } from "./sources/hackernews.js";

const client = new Anthropic();

export interface DigestCategory {
  category: string;
  items: { title: string; summary: string; url: string }[];
}

export interface DigestResult {
  trend: string;
  categories: DigestCategory[];
}

export async function summarize(articles: Article[]): Promise<DigestResult> {
  if (articles.length === 0) {
    return {
      trend: "오늘은 주목할 만한 AI 소식이 없습니다.",
      categories: [],
    };
  }

  const input = articles
    .map((a, i) => `${i + 1}. [${a.source}] ${a.title} (${a.score}점)\n   ${a.url}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `아래는 오늘 수집된 AI 관련 인기 글 목록입니다. JSON으로 정리해주세요.

규칙:
- AI와 무관하거나 중복되는 글은 제거
- 비슷한 주제끼리 묶어서 3~5개 카테고리로 분류
- 각 글을 1줄로 요약
- 전체적인 오늘의 트렌드를 2~3문장으로 작성

반드시 아래 JSON 형식만 출력하세요 (코드블록 없이 순수 JSON만):
{
  "trend": "오늘의 트렌드 요약 2~3문장",
  "categories": [
    {
      "category": "카테고리명",
      "items": [
        { "title": "글 제목", "summary": "한줄 요약", "url": "원문 URL" }
      ]
    }
  ]
}

글 목록:
${input}`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    return { trend: "요약 생성 실패", categories: [] };
  }

  try {
    return JSON.parse(block.text) as DigestResult;
  } catch {
    return { trend: block.text, categories: [] };
  }
}
