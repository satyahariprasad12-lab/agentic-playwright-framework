import { test } from '../core/hooks';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('SauceDemo login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await expect(page).toHaveURL(/inventory/);
 

});
