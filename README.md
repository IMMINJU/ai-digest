# AI Digest

AI 관련 뉴스를 자동 수집하고, Claude로 요약해서 매일 아침 Google Chat으로 발송하는 봇.

## Sources

- **Hacker News** — 상위 인기글 중 AI 관련 필터링
- **Reddit** — ChatGPT, LocalLLaMA, ClaudeAI, AI_Agents, singularity, ArtificialIntelligence, OpenAI
- **Product Hunt** — AI 관련 신규 프로덕트
- **GeekNews** — 한국 개발/기술 뉴스

## How it works

1. GitHub Actions cron이 평일 10:00 KST에 실행
2. 각 소스에서 AI 관련 인기 글 수집
3. Claude API로 카테고리 분류 + 한국어 요약
4. Google Chat 웹훅으로 발송

## Setup

GitHub repo **Settings → Secrets → Actions**에 추가:

| Secret | 설명 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `GOOGLE_CHAT_WEBHOOK_URL` | Google Chat 스페이스 웹훅 URL |

## Local

```bash
npm install

# dry run (콘솔 출력만)
ANTHROPIC_API_KEY=sk-... npm run test

# 실행
ANTHROPIC_API_KEY=sk-... GOOGLE_CHAT_WEBHOOK_URL=https://... npm run digest
```
