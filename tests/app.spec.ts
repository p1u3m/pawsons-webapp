import { test, expect } from "@playwright/test";
import { calculateType, characters } from "../src/lib/data";

test("quiz majority scoring can reach every character and rejects incomplete answers", () => {
  for (const c of characters) {
    const choices = [
      c.type[0] === "I" ? 1 : 0,
      c.type[1] === "N" ? 1 : 0,
      c.type[2] === "F" ? 1 : 0,
      c.type[3] === "P" ? 1 : 0,
    ];
    const answers = choices.flatMap((a) => [a, a]).concat(choices);
    expect(calculateType(answers)).toBe(c.type);
    for (let d = 0; d < 4; d++) {
      const mixed = [...answers];
      mixed[d * 2] = 1 - choices[d];
      expect(calculateType(mixed)).toBe(c.type);
      mixed[d * 2 + 1] = 1 - choices[d];
      expect(calculateType(mixed)).not.toBe(c.type);
    }
  }
  expect(() => calculateType([0, 1])).toThrow();
});

test("mobile navigation, filtering, quiz result, and story download", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A little place to be you." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "เปิดเมนู" }).click();
  await page
    .locator("#mobile-menu")
    .getByRole("link", { name: "Characters", exact: true })
    .click();
  await expect(page.locator(".character-card")).toHaveCount(16);
  await page.getByRole("button", { name: "Clover", exact: true }).click();
  await expect(page.locator(".character-card")).toHaveCount(4);
  await page.getByRole("searchbox").fill("Kumo");
  await expect(page.locator(".character-card")).toHaveCount(1);
  await page.locator(".character-card").click();
  await expect(page.getByRole("heading", { name: "Meet Kumo." })).toBeVisible();
  await page.goto("/quiz");
  await page.getByRole("button", { name: "เริ่มทำแบบทดสอบ" }).click();
  await expect(page.getByRole("button", { name: "ข้อต่อไป" })).toBeDisabled();
  const answers = Array(12).fill(1);
  for (let i = 0; i < 12; i++) {
    await page.getByRole("radio").nth(answers[i]).check();
    if (i === 1) {
      await page.getByRole("button", { name: "ย้อนกลับ" }).click();
      await expect(page.getByRole("radio").nth(1)).toBeChecked();
      await page.getByRole("button", { name: "ข้อต่อไป" }).click();
      await expect(page.getByRole("radio").nth(1)).toBeChecked();
    }
    await page
      .getByRole("button", { name: i === 11 ? "พบเพื่อนของคุณ" : "ข้อต่อไป" })
      .click();
  }
  await expect(page).toHaveURL(/results\/infp/);
  await expect(
    page.getByRole("heading", { name: "You feel like Kumo." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "แชร์เพื่อนของคุณ" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "ดาวน์โหลด Story Card" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("pawsons-kumo-story.png");
  await download.saveAs("test-results/story-card.png");
  expect(errors).toEqual([]);
});

test("routes render at mobile and desktop without horizontal overflow", async ({
  page,
}) => {
  const routes = [
    "/",
    "/characters",
    "/characters/intj",
    "/houses",
    "/houses/clover",
    "/contents",
    "/contents/1",
    "/contents?character=INFP",
    "/shop",
    "/shop?character=INFP",
    "/letters",
    "/quiz",
    "/results/infp",
    "/share/infp",
    "/share/isfj",
  ];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${width}: ${route}`,
      ).toBe(true);
    }
  }
});

test("empty search and invalid character are handled", async ({ page }) => {
  await page.goto("/characters");
  await page.getByRole("searchbox").fill("nobody");
  await expect(
    page.getByRole("heading", { name: "ยังไม่เจอเพื่อนที่ตามหา" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ดูเพื่อนทั้งหมด", exact: true })
    .click();
  await expect(page.locator(".character-card")).toHaveCount(16);
  await page.goto("/characters/missing");
  await expect(
    page.getByRole("heading", { name: "ดูเหมือนเราจะหลงทางนิดหน่อย" }),
  ).toBeVisible();
});

test("capture desktop and mobile layouts", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".friend-three img")).toBeVisible();
    await page.screenshot({
      path: `test-results/home-${name}.png`,
      fullPage: true,
    });
  }
});
