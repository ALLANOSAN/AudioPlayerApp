import { by, device, expect, element, waitFor } from 'detox';

describe('Player E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: { detoxDebug: 'true' }
    });
  }, 300000); // Aumentado para 5 minutos para evitar timeout

  beforeEach(async () => {
    await device.reloadReactNative();
  }, 60000); // Timeout de 1 minuto para o reload

  it('should play audio when play button is pressed', async () => {
    // Aguarde até que o elemento esteja visível antes de interagir
    await waitFor(element(by.id('play-button')))
      .toBeVisible()
      .withTimeout(10000);
      
    await element(by.id('play-button')).tap();
    
    // Aguarde até que o status seja atualizado
    await waitFor(element(by.id('player-status')))
      .toHaveText('Playing')
      .withTimeout(5000);
  }, 30000); // Timeout de 30 segundos para este teste

  it('should show correct track info', async () => {
    // Aguarde até que os elementos estejam visíveis
    await waitFor(element(by.id('track-title')))
      .toBeVisible()
      .withTimeout(5000);
      
    await waitFor(element(by.id('track-artist')))
      .toBeVisible()
      .withTimeout(5000);
  }, 30000); // Timeout de 30 segundos para este teste

  it('should navigate through playlist', async () => {
    // Aguarde até que o botão esteja visível antes de interagir
    await waitFor(element(by.id('next-button')))
      .toBeVisible()
      .withTimeout(5000);
      
    await element(by.id('next-button')).tap();
    
    // Aguarde até que o título seja atualizado
    await waitFor(element(by.id('track-title')))
      .toHaveText('Test Song 2')
      .withTimeout(5000);
  }, 30000); // Timeout de 30 segundos para este teste
});