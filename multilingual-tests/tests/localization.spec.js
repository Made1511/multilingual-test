import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Crear carpeta screenshots si no existe
const screenshotDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

const languages = [
  { code: 'en', title: 'Localization Test', files2: '2 files' },
  { code: 'es', title: 'Prueba de Localización', files2: '2 archivos' },
  { code: 'ar', title: 'اختبار التوطين', files2: 'ملفان' }
];

test.describe('Localization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  for (const lang of languages) {
    test(`should display correct content in ${lang.code}`, async ({ page }) => {
      await page.selectOption('#lang-select', lang.code);

      await page.waitForFunction(
        (expectedTitle) => {
          const h1 = document.querySelector('h1');
          return h1?.textContent?.trim() === expectedTitle;
        },
        lang.title,
        { timeout: 5000 }
      );

      const filesText = await page
        .locator('[data-i18n="files"][data-i18n-count="2"]')
        .textContent();
      expect(filesText?.trim()).toBe(lang.files2);

      // 📸 Captura de pantalla completa
      const fullPath = path.join(screenshotDir, `${lang.code}-full.png`);
      console.log(`Intentando generar screenshot completo: ${fullPath}`);
      await page.screenshot({ path: fullPath, fullPage: true });
      const existsFull = fs.existsSync(fullPath);
      console.log(`✅ ¿Se generó ${lang.code}-full.png?`, existsFull);

      // 📸 Captura de la tarjeta específica
      const card = page.locator('.card');
      if (await card.count() > 0) {
        const cardPath = path.join(screenshotDir, `${lang.code}-card.png`);
        console.log(`Intentando generar screenshot de la tarjeta: ${cardPath}`);
        await card.screenshot({ path: cardPath });
        const existsCard = fs.existsSync(cardPath);
        console.log(`✅ ¿Se generó ${lang.code}-card.png?`, existsCard);
      } else {
        console.log(`No se encontró .card para idioma ${lang.code}, no se genera screenshot de tarjeta.`);
      }
    });
  }

  test('should not have ICU syntax in DOM', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1?.textContent?.length > 0;
    });

    const elements = await page.locator('[data-i18n]').all();
    let hasUnprocessedICU = false;

    for (let i = 0; i < elements.length; i++) {
      const text = await elements[i].textContent();
      if (text && (/\{count, plural/.test(text) || /\{#/.test(text))) {
        console.log(`FOUND ICU in rendered element ${i}: "${text}"`);
        hasUnprocessedICU = true;
        break;
      }
    }

    console.log('Has unprocessed ICU in rendered content:', hasUnprocessedICU);
    expect(hasUnprocessedICU).toBe(false);
  });
});