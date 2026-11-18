import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 URL 변환 화면이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/FeedMe/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("URL을 Markdown으로");
});
