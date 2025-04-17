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
  var __reanimatedWorkletInit: () => void;
  var withTiming: (value: AnimatableValue, config?: WithTimingConfig) => AnimatableValue;
  var withSpring: (value: AnimatableValue, config?: WithTimingConfig) => AnimatableValue;
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

  // Sobrescreve os defaults globais
  global.__reanimatedWorkletInit = () => {
    'worklet';
    global.withTiming = (value, config) => 
      withTiming(value, { ...baseConfig, ...config });
    global.withSpring = (value, config) => 
      withSpring(value, { ...baseConfig, ...config });
  };
};

// Inicialização segura
export const initializeAnimations = async () => {
  const isReducedMotion = await checkReducedMotion();
  configureReanimated(isReducedMotion);
  return isReducedMotion;
};