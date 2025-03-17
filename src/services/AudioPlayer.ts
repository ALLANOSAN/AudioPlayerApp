import { Audio } from 'expo-av';

const sound = new Audio.Sound();

export const playAudio = async (uri: string) => {
  try {
    await sound.unloadAsync(); // Remove áudio anterior, se houver
    await sound.loadAsync({ uri });
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao reproduzir áudio:', error);
  }
};

export const pauseAudio = async () => {
  try {
    await sound.pauseAsync();
  } catch (error) {
    console.error('Erro ao pausar áudio:', error);
  }
};

export const resumeAudio = async () => {
  try {
    await sound.playAsync();
  } catch (error) {
    console.error('Erro ao retomar áudio:', error);
  }
};
