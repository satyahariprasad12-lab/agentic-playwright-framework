import { test as base, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { captureDOMSnapshot } from '../utils/domSnapshot';
import { suggestLocatorFromDOM } from '../agents/selfHealing.agent';
import { validateLocator } from './locatorValidator';
import { updateLocatorStore } from './locatorStoreUpdater';

export const test = base.extend({});

function extractLocatorKey(errorMessage: string): string | null {
  const match = errorMessage.match(/key:\s*(\w+)/);
  return match ? match[1] : null;
}

test.afterEach(async ({ page }, testInfo: TestInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {

    /* 1️⃣ Screenshot */
    const screenshotDir = path.join(process.cwd(), 'reports', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(
      screenshotDir,
      `${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    );

    const screenshotBuffer = await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await testInfo.attach('Failure Screenshot', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });

    console.log(`📸 Screenshot saved & attached`);

    /* 2️⃣ Locator failure detection */
    const error = testInfo.error as any;

    if (
      error?.message?.includes('LocatorResolutionError') ||
      error?.message?.includes('All locators failed')
    ) {
      console.log('🤖 Locator failure detected. Starting AI healing...');

      /* 3️⃣ DOM snapshot */
      const domPath = await captureDOMSnapshot(page, testInfo.title);

      await testInfo.attach('DOM Snapshot', {
        path: domPath,
        contentType: 'text/html',
      });

      /* 4️⃣ Extract failed locator key */
      const failedLocatorKey = extractLocatorKey(error.message);

      if (!failedLocatorKey) {
        console.warn('⚠️ Could not extract locator key');
        return;
      }

      /* 5️⃣ Ask AI */
      const aiSuggestedLocator = await suggestLocatorFromDOM(
        domPath,
        `${failedLocatorKey} input field`
      );

      await testInfo.attach('AI Locator Suggestion', {
        body: Buffer.from(aiSuggestedLocator),
        contentType: 'text/plain',
      });

      console.log(`🤖 AI suggested locator: ${aiSuggestedLocator}`);

      /* 6️⃣ Validate AI locator */
      const validation = await validateLocator(page, aiSuggestedLocator);

      await testInfo.attach('AI Locator Validation', {
        body: Buffer.from(
          JSON.stringify(
            {
              locatorKey: failedLocatorKey,
              suggestedByAI: aiSuggestedLocator,
              normalizedSelector: validation.selector,
              valid: validation.valid,
            },
            null,
            2
          )
        ),
        contentType: 'application/json',
      });

      console.log(
        validation.valid
          ? `✅ AI locator VALID: ${validation.selector}`
          : `❌ AI locator INVALID: ${validation.selector}`
      );

      /* 7️⃣ Auto-heal (LOCAL + FIRST ATTEMPT ONLY) */
      const isFirstAttempt = testInfo.retry === 0;

      if (validation.valid && isFirstAttempt && !process.env.CI) {
        updateLocatorStore(failedLocatorKey, validation.selector);

        await testInfo.attach('Locator Auto-Healed', {
          body: Buffer.from(
            JSON.stringify(
              {
                locatorKey: failedLocatorKey,
                newPrimary: validation.selector,
                updatedLocally: true,
              },
              null,
              2
            )
          ),
          contentType: 'application/json',
        });

        console.log(
          `🛠️ Locator auto-healed: ${failedLocatorKey} → ${validation.selector}`
        );
      }
    }
  }
});
