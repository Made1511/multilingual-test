import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Crear carpeta screenshots si no existe
const screenshotDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

test('captura básica y verificación de permisos', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000); // espera breve para asegurar carga

  const fullPath = path.join(screenshotDir, 'test-basic.png');
  console.log('🧪 Capturando página completa en:', fullPath);

  try {
    // Intento de captura con Playwright
    await page.screenshot({ path: fullPath, fullPage: true });

    // Verificar si el archivo existe
    const exists = fs.existsSync(fullPath);
    console.log(`✅ ¿Se generó test-basic.png con Playwright?`, exists);

    // Si no existe, intentamos escribir manualmente para confirmar permisos
    if (!exists) {
      console.log('⚠️ No se generó el screenshot, probando escritura manual...');
      fs.writeFileSync(fullPath, Buffer.from('test'));
      const manualExists = fs.existsSync(fullPath);
      console.log(`🧪 Intento manual: ¿Se pudo escribir en ${fullPath}?`, manualExists);
    }
  } catch (err) {
    console.error('❌ Error al generar screenshot:', err);
  }
});