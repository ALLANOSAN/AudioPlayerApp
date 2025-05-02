import { Audio } from 'expo-av';
import { Logger } from '../utils/logger';

export class EqualizerService {
  private static instance: EqualizerService;
  private bands: Map<number, number> = new Map();
  private isEnabled: boolean = false;

  private constructor() {
    this.initializeBands();
  }

  public static getInstance(): EqualizerService {
    if (!EqualizerService.instance) {
      EqualizerService.instance = new EqualizerService();
    }
    return EqualizerService.instance;
  }

  private initializeBands() {
    // Frequências padrão do equalizador (Hz)
    const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    frequencies.forEach(freq => {
      this.bands.set(freq, 0); // 0dB = flat response
    });
  }

  async enable() {
    try {
      this.isEnabled = true;
      Logger.debug('Equalizador ativado');
      await this.applySettings();
    } catch (error) {
      Logger.error('Erro ao ativar equalizador:', error);
      throw error;
    }
  }

  async disable() {
    try {
      this.isEnabled = false;
      Logger.debug('Equalizador desativado');
      await this.resetBands();
    } catch (error) {
      Logger.error('Erro ao desativar equalizador:', error);
      throw error;
    }
  }

  async setBand(frequency: number, gain: number) {
    try {
      if (!this.bands.has(frequency)) {
        throw new Error('Frequência inválida');
      }
      
      // Limita o ganho entre -12dB e +12dB
      const limitedGain = Math.max(-12, Math.min(12, gain));
      this.bands.set(frequency, limitedGain);
      
      if (this.isEnabled) {
        await this.applySettings();
      }
      
      Logger.debug(`Banda ${frequency}Hz ajustada para ${limitedGain}dB`);
    } catch (error) {
      Logger.error('Erro ao ajustar banda:', error);
      throw error;
    }
  }

  async setPreset(preset: 'flat' | 'rock' | 'pop' | 'jazz' | 'classical') {
    try {
      switch (preset) {
        case 'flat':
          await this.resetBands();
          break;
        case 'rock':
          await this.applyRockPreset();
          break;
        case 'pop':
          await this.applyPopPreset();
          break;
        case 'jazz':
          await this.applyJazzPreset();
          break;
        case 'classical':
          await this.applyClassicalPreset();
          break;
      }
      Logger.debug(`Preset ${preset} aplicado`);
    } catch (error) {
      Logger.error('Erro ao aplicar preset:', error);
      throw error;
    }
  }

  private async resetBands() {
    for (const frequency of this.bands.keys()) {
      this.bands.set(frequency, 0);
    }
    await this.applySettings();
  }

  private async applyRockPreset() {
    const rockSettings = new Map([
      [60, 4],    // Bass boost
      [170, 3],   // Sub-bass
      [310, 2],   // Bass
      [600, 0],   // Low-mids
      [1000, -1], // Mids
      [3000, 2],  // High-mids
      [6000, 3],  // Presence
      [12000, 4], // Brilliance
      [14000, 4], // High-end
      [16000, 4]  // Air
    ]);
    
    for (const [freq, gain] of rockSettings) {
      await this.setBand(freq, gain);
    }
  }

  private async applyPopPreset() {
    const popSettings = new Map([
      [60, -1],   // Less bass
      [170, 2],   // Controlled sub-bass
      [310, 3],   // Enhanced bass
      [600, 2],   // Warm low-mids
      [1000, 2],  // Forward mids
      [3000, 2],  // Clear high-mids
      [6000, 3],  // Presence boost
      [12000, 3], // Air
      [14000, 2], // Sparkle
      [16000, 1]  // Top end
    ]);
    
    for (const [freq, gain] of popSettings) {
      await this.setBand(freq, gain);
    }
  }

  private async applyJazzPreset() {
    const jazzSettings = new Map([
      [60, 2],    // Warm bass
      [170, 2],   // Full sub-bass
      [310, 1],   // Controlled bass
      [600, 0],   // Natural low-mids
      [1000, -1], // Recessed mids
      [3000, 1],  // Clear high-mids
      [6000, 2],  // Presence
      [12000, 2], // Air
      [14000, 1], // Subtle sparkle
      [16000, 0]  // Natural top
    ]);
    
    for (const [freq, gain] of jazzSettings) {
      await this.setBand(freq, gain);
    }
  }

  private async applyClassicalPreset() {
    const classicalSettings = new Map([
      [60, 0],    // Flat bass
      [170, 1],   // Subtle warmth
      [310, 1],   // Light bass
      [600, 0],   // Clear low-mids
      [1000, 0],  // Natural mids
      [3000, 1],  // Present high-mids
      [6000, 2],  // Detail
      [12000, 2], // Air
      [14000, 1], // Light brilliance
      [16000, 1]  // Subtle air
    ]);
    
    for (const [freq, gain] of classicalSettings) {
      await this.setBand(freq, gain);
    }
  }

  private async applySettings() {
    if (!this.isEnabled) return;

    try {
      // Aqui seria a implementação específica para aplicar
      // as configurações do equalizador ao sistema de áudio
      Logger.debug('Configurações do equalizador aplicadas');
    } catch (error) {
      Logger.error('Erro ao aplicar configurações:', error);
      throw error;
    }
  }

  getBands(): Map<number, number> {
    return new Map(this.bands);
  }

  isEqualizerEnabled(): boolean {
    return this.isEnabled;
  }
}