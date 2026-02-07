import fs from 'fs';
import { askGroq } from '../llm/groq.client';

export async function suggestLocatorFromDOM(
    domFilePath: string,
    intent: string
): Promise<string> {
    const dom = fs.readFileSync(domFilePath, 'utf-8');

    const prompt = `
You are a Playwright test automation expert.

Your task:
Find the BEST Playwright locator for the element described as:
"${intent}"

Rules:
- Prefer id, data-test, name, aria-label
- Output ONLY ONE selector
- Do NOT explain
- If unsure, still suggest the best possible selector

HTML DOM:
${dom.slice(0, 6000)}
`;


    const response = await askGroq(prompt);

    return response.trim();
}
