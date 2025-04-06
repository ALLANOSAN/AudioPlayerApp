import { by, device, expect, element } from 'detox';

describe('Player E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should play audio when play button is pressed', async () => {
    await element(by.id('play-button')).tap();
    await expect(element(by.id('player-status'))).toHaveText('Playing');
  });

  it('should show correct track info', async () => {
    await expect(element(by.id('track-title'))).toBeVisible();
    await expect(element(by.id('track-artist'))).toBeVisible();
  });

  it('should navigate through playlist', async () => {
    await element(by.id('next-button')).tap();
    await expect(element(by.id('track-title'))).toHaveText('Test Song 2');
  });
});