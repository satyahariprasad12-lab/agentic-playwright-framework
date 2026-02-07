import { Page } from '@playwright/test';

/**
 * Converts AI output into a Playwright-friendly selector
 */
function normalizeSelector(aiSuggestion: string): string {
  // If AI already returned CSS selector
  if (aiSuggestion.startsWith('[') || aiSuggestion.startsWith('#')) {
    return aiSuggestion;
  }

  // Convert attribute format → CSS selector
  if (aiSuggestion.includes('=')) {
    return `[${aiSuggestion}]`;
  }

  return aiSuggestion;
}

export async function validateLocator(
  page: Page,
  aiSuggestion: string
): Promise<{ valid: boolean; selector: string }> {
  const selector = normalizeSelector(aiSuggestion);

  try {
    const count = await page.locator(selector).count();
    return {
      valid: count > 0,
      selector,
    };
  } catch {
    return {
      valid: false,
      selector,
    };
  }
}
