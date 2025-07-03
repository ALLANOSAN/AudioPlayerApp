import { NativeModules, Platform } from 'react-native';
import {
  enableLayoutAnimations,
  withTiming,
  withSpring,
  ReduceMotion,
  type WithTimingConfig,
  type AnimatableValue
} from 'react-native-reanimated';

// Extendendo a interface global para incluir nossas propriedades
declare global {
  interface GlobalThis {
    __reanimatedWorkletInit?: () => void;
    withTiming?: (value: AnimatableValue, config?: WithTimingConfig) => AnimatableValue;
    withSpring?: (value: AnimatableValue, config?: WithTimingConfig) => AnimatableValue;
  }
}

// Verifica se o reduced motion está ativado
export const checkReducedMotion = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      return NativeModules.UIAccessibility?.isReduceMotionEnabled?.() || false;
    }
    if (Platform.OS === 'android') {
      const value = await NativeModules.Settings?.ANIMATOR_DURATION_SCALE?.();
      return value === 0;
    }
    return false;
  } catch (error) {
    console.warn('Error checking reduced motion:', error);
    return false;
  }
};

// Configurações adaptativas de animação
export const configureReanimated = (isReducedMotion?: boolean) => {
  // Desabilita animações de layout se reduced motion estiver ativo
  enableLayoutAnimations(!isReducedMotion);

  // Configurações padrão para animações
  const baseConfig: WithTimingConfig = {
    duration: isReducedMotion ? 150 : 300,
    reduceMotion: isReducedMotion ? ReduceMotion.Always : ReduceMotion.Never,
  };

  // Variável auxiliar para acessar propriedades extras em globalThis
  const globalWithReanimated = globalThis as GlobalThis;

  // Sobrescreve os defaults globais
  globalWithReanimated.__reanimatedWorkletInit = () => {
    'worklet';
    globalWithReanimated.withTiming = (value: AnimatableValue, config?: WithTimingConfig) =>
      withTiming(value, { ...baseConfig, ...config });
    globalWithReanimated.withSpring = (value: AnimatableValue, config?: WithTimingConfig) =>
      withSpring(value, { ...baseConfig, ...config });
  };
};

// Inicialização segura
export const initializeAnimations = async () => {
  const isReducedMotion = await checkReducedMotion();
  configureReanimated(isReducedMotion);
  return isReducedMotion;
};