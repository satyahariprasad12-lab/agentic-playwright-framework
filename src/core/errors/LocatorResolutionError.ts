export class LocatorResolutionError extends Error {
  locatorKey: string;
  triedSelectors: string[];

  constructor(locatorKey: string, triedSelectors: string[]) {
    super(`All locators failed for key: ${locatorKey}`);

    this.name = 'LocatorResolutionError'; // 🔥 REQUIRED
    this.locatorKey = locatorKey;
    this.triedSelectors = triedSelectors;
  }
}
