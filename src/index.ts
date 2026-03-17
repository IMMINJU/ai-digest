import { fetchHackerNews } from "./sources/hackernews.js";
import { fetchReddit } from "./sources/reddit.js";
import { fetchProductHunt } from "./sources/producthunt.js";
import { fetchGeekNews } from "./sources/geeknews.js";
import { summarize } from "./summarizer.js";
import { sendToGoogleChat } from "./notifier.js";

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  console.log("📡 Collecting articles...");

  const [hn, reddit, ph, gn] = await Promise.all([
    fetchHackerNews(),
    fetchReddit(),
    fetchProductHunt(),
    fetchGeekNews(),
  ]);

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

  const title = `AI Digest — ${today}`;

  if (isDryRun) {
    console.log("\n--- DRY RUN ---\n");
    console.log(`📊 ${title}`);
    console.log(`\n트렌드: ${digest.trend}\n`);
    for (const cat of digest.categories) {
      console.log(`\n[${cat.category}]`);
      for (const item of cat.items) {
        console.log(`  • ${item.title}: ${item.summary}`);
        console.log(`    ${item.url}`);
      }
    }
    return;
  }

  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("GOOGLE_CHAT_WEBHOOK_URL is not set");
  }

  console.log("📤 Sending to Google Chat...");
  await sendToGoogleChat(webhookUrl, title, digest);
  console.log("✅ Done!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
