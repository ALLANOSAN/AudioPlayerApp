import MusicControl, { Command } from 'react-native-music-control';
import { playAudio, pauseAudio } from './AudioPlayer'; // Ajuste o caminho se necessário

export const setupMusicControl = () => {
  // Ativar suporte ao modo em segundo plano
  MusicControl.enableBackgroundMode(true);

  // Pausar reprodução durante interrupções de áudio (chamadas, etc.)
  MusicControl.handleAudioInterruptions(true);

  // Configurar opções de "Now Playing"
  MusicControl.setNowPlaying({
    title: 'Título da Música',
    artist: 'Nome do Artista',
    artwork: 'https://link-para-imagem-da-capa.com/capa.jpg', // Opcional
    duration: 300, // Duração em segundos
  });

  // Habilitar controles
  MusicControl.enableControl('play', true);
  MusicControl.enableControl('pause', true);
  MusicControl.enableControl('stop', true);
  MusicControl.enableControl('nextTrack', true);
  MusicControl.enableControl('previousTrack', true);
  MusicControl.enableControl('changePlaybackPosition', true);

  // Registrar eventos de ação
  MusicControl.on(Command.play, () => {
    console.log('Notificação: Play pressionado');
    playAudio('https://link-da-musica.mp3'); // Use a URL real ou ajuste conforme necessário
  });

  MusicControl.on(Command.pause, () => {
    console.log('Notificação: Pause pressionado');
    pauseAudio();
  });

  MusicControl.on(Command.stop, () => {
    console.log('Notificação: Stop pressionado');
    MusicControl.resetNowPlaying();
  });

  MusicControl.on(Command.nextTrack, () => {
    console.log('Notificação: Próxima música pressionada');
    // Adicione lógica para reproduzir a próxima música
  });

  MusicControl.on(Command.previousTrack, () => {
    console.log('Notificação: Música anterior pressionada');
    // Adicione lógica para reproduzir a música anterior
  });

  MusicControl.on(Command.changePlaybackPosition, (playbackPosition) => {
    console.log(`Notificação: Posição de reprodução alterada para ${playbackPosition} segundos`);
    // Adicione lógica para buscar a posição específica
  });

  // Outros comandos (opcional)
  MusicControl.on(Command.seekForward, () => {
    console.log('Notificação: Avanço rápido acionado');
  });

  MusicControl.on(Command.seekBackward, () => {
    console.log('Notificação: Retrocesso rápido acionado');
  });

  MusicControl.on(Command.seek, (pos) => {
    console.log(`Notificação: Buscando para ${pos} segundos`);
  });

  MusicControl.on(Command.setRating, (rating) => {
    console.log(`Notificação: Avaliação definida como ${rating}`);
  });

  MusicControl.on(Command.closeNotification, () => {
    console.log('Notificação: Fechar notificação acionado');
    // Adicione lógica para parar o áudio e limpar o player
  });
};
