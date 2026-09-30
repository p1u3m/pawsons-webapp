import { test, expect } from "@playwright/test";

test("catalog, cart drawer, and product detail keep server prices", async ({
  page,
}) => {
  await page.goto("/shop");
  await expect(page.locator(".store-card")).toHaveCount(8);
  const first = page.locator(".store-card").first();
  await expect(first).toContainText("฿59");
  await first.getByRole("button", { name: /ลงตะกร้า/ }).click();

  await page.getByRole("button", { name: "เปิดตะกร้า มีสินค้า 1 ชิ้น" }).click();
  const drawer = page.getByRole("dialog", { name: /ตะกร้า/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator(".store-checkout-total")).toContainText("฿59");
  await drawer.getByRole("button", { name: "เพิ่มจำนวน" }).click();
  await expect(drawer.locator(".store-checkout-total")).toContainText("฿118");

  // The cart lives in localStorage, so it survives a reload.
  await page.reload();
  await page.getByRole("button", { name: "เปิดตะกร้า มีสินค้า 2 ชิ้น" }).click();
  await expect(drawer.locator(".store-checkout-total")).toContainText("฿118");
  await drawer.getByRole("button", { name: /ออกจากตะกร้า/ }).click();
  await expect(drawer.getByText("ตะกร้ายังว่างอยู่")).toBeVisible();

  await page.goto("/shop/infp-sticker");
  await expect(
    page.getByRole("heading", { name: "INFP · Sticker" }),
  ).toBeVisible();
});

test("mobile shop does not overflow and admin is protected", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/shop", "/shop/infp-sticker"]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/admin/shop");
  await expect(page).toHaveURL("/");
});

test("checkout and order history require sign-in", async ({ page, request }) => {
  await page.goto("/shop/infp-sticker");
  await page.getByRole("button", { name: /ลงตะกร้า/ }).first().click();
  await page.getByRole("button", { name: /เปิดตะกร้า/ }).click();
  const drawer = page.getByRole("dialog", { name: /ตะกร้า/ });
  await expect(
    drawer.getByRole("button", { name: "เข้าสู่ระบบเพื่อชำระเงิน" }),
  ).toBeEnabled();

  const response = await request.post("/api/stripe/shop-checkout", {
    headers: { origin: "http://localhost:3000" },
    data: { items: [{ slug: "infp-sticker", quantity: 1 }] },
  });
  // 503 when the sandbox is not configured on this machine.
  expect([401, 503]).toContain(response.status());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop/orders");
  await expect(
    page.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await page.goto("/shop/orders/00000000-0000-0000-0000-000000000000");
  await expect(page).toHaveURL("/shop/orders");
});
