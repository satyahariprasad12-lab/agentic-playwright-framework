const healedTests = new Set<string>();

export function markHealed(testTitle: string) {
  healedTests.add(testTitle);
}

export function wasHealed(testTitle: string): boolean {
  return healedTests.has(testTitle);
}
