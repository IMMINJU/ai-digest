import { fetchHackerNews } from "./sources/hackernews.js";
import { fetchReddit } from "./sources/reddit.js";
import { fetchProductHunt } from "./sources/producthunt.js";
import { fetchGeekNews } from "./sources/geeknews.js";
import { summarize } from "./summarizer.js";
import { sendToGoogleChat } from "./notifier.js";

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  console.log("📡 Collecting articles...");

  const results = await Promise.allSettled([
    fetchHackerNews(),
    fetchReddit(),
    fetchProductHunt(),
    fetchGeekNews(),
  ]);

  const extract = <T>(r: PromiseSettledResult<T[]>, name: string): T[] => {
    if (r.status === "fulfilled") return r.value;
    console.warn(`⚠️ ${name} failed:`, (r.reason as Error).message);
    return [];
  };

  const [hn, reddit, ph, gn] = [
    extract(results[0], "HackerNews"),
    extract(results[1], "Reddit"),
    extract(results[2], "ProductHunt"),
    extract(results[3], "GeekNews"),
  ];

  const all = [...hn, ...reddit, ...ph, ...gn];
  console.log(`  HN: ${hn.length}, Reddit: ${reddit.length}, PH: ${ph.length}, GeekNews: ${gn.length} → Total: ${all.length}`);

  if (all.length === 0) {
    console.log("No articles found. Skipping.");
    return;
  }

  console.log("🤖 Summarizing with Claude...");
  const digest = await summarize(all);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const message = `🤖 *AI Digest — ${today}*\n\n${digest}`;

  if (isDryRun) {
    console.log("\n--- DRY RUN ---\n");
    console.log(message);
    return;
  }

  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("GOOGLE_CHAT_WEBHOOK_URL is not set");
  }

  console.log("📤 Sending to Google Chat...");
  await sendToGoogleChat(webhookUrl, message);
  console.log("✅ Done!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
