import { Page, Locator } from '@playwright/test';
import { locatorStore } from './locatorStore';
import { LocatorResolutionError } from './errors/LocatorResolutionError';

export async function resolveLocator(
  page: Page,
  key: string
): Promise<Locator> {
  const config = locatorStore[key];
  if (!config) {
    throw new Error(`❌ Locator key not found: ${key}`);
  }

  const selectors = [config.primary, ...(config.fallbacks ?? [])];

  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      if (await locator.count() > 0) {
        return locator.first();
      }
    } catch {

    }
  }

  throw new LocatorResolutionError(key, selectors);
}
