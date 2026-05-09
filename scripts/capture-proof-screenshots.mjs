import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve('docs/growth/proof/screenshots');
const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3108';

async function waitForServer(url, timeoutMs = 120_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function run() {
  await mkdir(outputDir, { recursive: true });

  let server;
  if (!process.env.PLAYWRIGHT_BASE_URL) {
    server = spawn('npm', ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', '3108'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: '3108' },
    });
    await waitForServer(baseUrl);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(baseUrl);
  await page.screenshot({ path: path.join(outputDir, '01-consult-workspace.png'), fullPage: true });

  await page.getByRole('button', { name: 'Load Demo Case' }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '02-demo-case-gallery.png'), fullPage: true });

  await page.getByRole('heading', { name: 'Cornerstone3D DICOM viewer' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(outputDir, '03-cornerstone-dicom-viewer.png'), fullPage: true });

  await page.getByRole('heading', { name: 'SMART/FHIR sandbox' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(outputDir, '04-smart-fhir-dicomweb-sandbox.png'), fullPage: true });

  await page.getByRole('heading', { name: 'Segmentation research overlay' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(outputDir, '05-segmentation-research-overlay.png'), fullPage: true });

  await browser.close();
  if (server) {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
