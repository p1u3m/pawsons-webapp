import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--remote-debugging-port=9223"],
});
try {
  const result = await lighthouse("http://localhost:3000", {
    port: 9223,
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    logLevel: "error",
  });
  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/lighthouse.json", result.report);
  console.log(
    JSON.stringify(
      {
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, value]) => [
            key,
            value.score,
          ]),
        ),
        metrics: Object.fromEntries(
          [
            "largest-contentful-paint",
            "cumulative-layout-shift",
            "total-blocking-time",
          ].map((key) => [key, result.lhr.audits[key].displayValue]),
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
