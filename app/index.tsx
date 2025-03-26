import { AppRegistry, LogBox } from 'react-native';
import App from '../App';
import appJson from '../app.json';

// Adicionar log para depuração
console.log('[AUDIO_APP_DEBUG] Iniciando aplicativo');

const appName = appJson.expo.name;
console.log('[AUDIO_APP_DEBUG] Nome do app:', appName);

// Acessando ErrorUtils de forma segura para TypeScript
const GlobalWithErrorUtils = global as typeof global & {
  ErrorUtils?: {
    setGlobalHandler: (callback: (error: Error, isFatal: boolean) => void) => void;
  };
};

// Configurando o handler de erros globais
if (GlobalWithErrorUtils.ErrorUtils) {
  console.log('[AUDIO_APP_DEBUG] Configurando ErrorUtils');
  GlobalWithErrorUtils.ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
    // Alterado de console.error para console.log para captura em logcat
    console.log('[AUDIO_APP_ERROR]', error?.message, 'Stack:', error?.stack);
  });
} else {
  console.log('[AUDIO_APP_DEBUG] ErrorUtils não disponível');
}

// Registre seu aplicativo
console.log('[AUDIO_APP_DEBUG] Registrando componente com nome:', appName);
AppRegistry.registerComponent(appName, () => App);