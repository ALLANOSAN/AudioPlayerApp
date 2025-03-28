import { Audio } from 'expo-av';
import { NotificationService } from './NotificationService';

const sound = new Audio.Sound();
const notificationService = NotificationService.getInstance();

export const playAudio = async (uri: string, title?: string, artist?: string, artwork?: string) => {
  try {
    await sound.unloadAsync(); // Remove áudio anterior, se houver
    await sound.loadAsync({ uri });
    
    // Configurar o callback de status
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        notificationService.updatePlaybackState(
          status.isPlaying,
          status.positionMillis / 1000
        );
      }
    });
    
    // Atualizar metadados da notificação se fornecidos
    if (title && artist) {
      const status = await sound.getStatusAsync();
      const duration = status.isLoaded && status.durationMillis ? status.durationMillis / 1000 : 0;
      
      notificationService.updateNotificationMetadata(
        title,
        artist,
        artwork,
        duration
      );
    }
    
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao reproduzir áudio:', error);
  }
};

export const pauseAudio = async () => {
  try {
    await sound.pauseAsync();
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      notificationService.updatePlaybackState(false, status.positionMillis / 1000);
    }
  } catch (error) {
    console.error('Erro ao pausar áudio:', error);
  }
};

export const resumeAudio = async () => {
  try {
    await sound.playAsync();
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      notificationService.updatePlaybackState(true, status.positionMillis / 1000);
    }
  } catch (error) {
    console.error('Erro ao retomar áudio:', error);
  }
};

export const stopAudio = async () => {
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
    notificationService.resetNotification();
  } catch (error) {
    console.error('Erro ao parar áudio:', error);
  }
};

export const seekAudio = async (positionSeconds: number) => {
  try {
    await sound.setPositionAsync(positionSeconds * 1000);
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      notificationService.updatePlaybackState(
        status.isPlaying,
        positionSeconds
      );
    }
  } catch (error) {
    console.error('Erro ao buscar posição:', error);
  }
};

export const getAudioPosition = async (): Promise<number> => {
  try {
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      return status.positionMillis / 1000;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao obter posição:', error);
    return 0;
  }
};

export const getAudioDuration = async (): Promise<number> => {
  try {
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.durationMillis) {
      return status.durationMillis / 1000;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao obter duração:', error);
    return 0;
  }
};

export const isAudioPlaying = async (): Promise<boolean> => {
  try {
    const status = await sound.getStatusAsync();
    return status.isLoaded ? status.isPlaying : false;
  } catch (error) {
    console.error('Erro ao verificar estado de reprodução:', error);
    return false;
  }
};
