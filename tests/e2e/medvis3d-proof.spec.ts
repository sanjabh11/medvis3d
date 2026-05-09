import { expect, test } from '@playwright/test';

test('MedVis3D proof surfaces are routed and claim-bounded', async ({ page }) => {
  await page.goto('/');

  // Demo case gallery visible
  await expect(page.getByRole('heading', { name: 'Demo case gallery visible' })).toBeVisible();
  await page.getByRole('button', { name: 'Load Demo Case' }).first().click();
  await expect(page.getByText('Ready for educational 3D visualization')).toBeVisible();

  await expect(page.getByRole('button', { name: /Consult Snapshot/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cornerstone3D DICOM viewer' })).toBeVisible();
  await expect(page.getByText('Safe metadata', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'SMART/FHIR sandbox' })).toBeVisible();
  await expect(page.getByText('Mock ImagingStudy', { exact: true })).toBeVisible();
  await expect(page.getByText(/DICOMweb endpoint/).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Segmentation research overlay' })).toBeVisible();
  await expect(page.getByText(/experimental overlay/i)).toBeVisible();
  await expect(page.getByText(/non-diagnostic/i)).toBeVisible();
});
