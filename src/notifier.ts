import type { DigestResult } from "./summarizer.js";

function buildCardV2(title: string, digest: DigestResult) {
  const sections: any[] = [];

  // 트렌드 요약 섹션
  sections.push({
    header: "📊 오늘의 트렌드",
    widgets: [
      {
        textParagraph: { text: digest.trend },
      },
    ],
  });

  // 카테고리별 섹션
  for (const cat of digest.categories) {
    const widgets: any[] = [];
    for (const item of cat.items) {
      widgets.push({
        decoratedText: {
          topLabel: item.summary,
          text: item.title,
          button: {
            text: "원문",
            onClick: { openLink: { url: item.url } },
          },
        },
      });
    }
    sections.push({
      header: cat.category,
      collapsible: widgets.length > 3,
      uncollapsibleWidgetsCount: 3,
      widgets,
    });
  }

  return {
    cardsV2: [
      {
        cardId: "ai-digest",
        card: {
          header: {
            title,
            subtitle: "AI 뉴스 다이제스트",
            imageUrl:
              "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/robot_2/default/48px.svg",
            imageType: "CIRCLE",
          },
          sections,
        },
      },
    ],
  };
}

export async function sendToGoogleChat(
  webhookUrl: string,
  title: string,
  digest: DigestResult
): Promise<void> {
  const payload = buildCardV2(title, digest);

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Google Chat webhook failed: ${res.status} ${res.statusText}`);
  }
}
