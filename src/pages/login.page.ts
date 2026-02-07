import { Page } from '@playwright/test';
import { resolveLocator } from '../core/locatorResolver';

export class LoginPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string) {
    const userInput = await resolveLocator(this.page, 'usernameInput');
    const passInput = await resolveLocator(this.page, 'passwordInput');
    const loginBtn = await resolveLocator(this.page, 'loginButton');

    await userInput.fill(username);
    await passInput.fill(password);
    await loginBtn.click();
  }
}
