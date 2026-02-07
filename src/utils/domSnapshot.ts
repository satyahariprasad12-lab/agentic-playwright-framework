import fs from 'fs';
import path from 'path';
import { Page } from '@playwright/test';

export async function captureDOMSnapshot(
  page: Page,
  testTitle: string
): Promise<string> {
  const dir = path.join(process.cwd(), 'reports', 'dom');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(
    dir,
    `${testTitle.replace(/[^a-zA-Z0-9]/g, '_')}.html`
  );

  const html = await page.content();
  fs.writeFileSync(filePath, html, 'utf-8');

  return filePath;
}
