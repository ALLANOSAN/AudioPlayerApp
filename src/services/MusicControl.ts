import MusicControl, { Command } from 'react-native-music-control';
import { getCurrentTrack, playCurrentSong } from 'screens/SongsScreen'; // Importação das funções de SongsScreen

export const setupMusicControl = async () => {
  // Obtém a música atual
  const currentTrack = getCurrentTrack();

  if (!currentTrack) {
    console.error('Nenhuma faixa encontrada para configurar os controles');
    return;
  }

  // Configurar o suporte para execução em segundo plano
  MusicControl.enableBackgroundMode(true);

  // Configurar os detalhes da notificação "Now Playing"
  MusicControl.setNowPlaying({
    title: currentTrack.name, // Título da música atual
    artist: currentTrack.artist, // Artista da música atual
    artwork: currentTrack.cover || 'D:/Estudos/AppdeAudio/AudioPlayerApp/assets/cover/default.jpg', // Capa do álbum (local ou padrão)
    duration: 300, // Duração da música (em segundos, ajustável conforme necessário)
  });

  // Habilitar controles na notificação
  MusicControl.enableControl('play', true); // Botão de play
  MusicControl.enableControl('pause', true); // Botão de pause
  MusicControl.enableControl('stop', true); // Botão de stop
  MusicControl.enableControl('nextTrack', true); // Botão para próxima música
  MusicControl.enableControl('previousTrack', true); // Botão para música anterior

  // Registrar eventos para os controles
  MusicControl.on(Command.play, () => {
    console.log(`Notificação: Play pressionado para ${currentTrack.name}`);
    playCurrentSong(currentTrack); // Tocar a música atual
  });

  MusicControl.on(Command.pause, async () => {
    console.log('Notificação: Pause pressionado');
    // Lógica para pausar o áudio (pode ser expandida futuramente)
  });

  MusicControl.on(Command.stop, () => {
    console.log('Notificação: Stop pressionado');
    MusicControl.resetNowPlaying(); // Limpa a notificação "Now Playing"
  });

  MusicControl.on(Command.nextTrack, () => {
    console.log('Notificação: Próxima música pressionada');
    const nextTrack = getCurrentTrack('next'); // Obtém a próxima música

    if (nextTrack) {
      setupMusicControl(); // Atualiza as informações da notificação
      playCurrentSong(nextTrack); // Toca a próxima música
    } else {
      console.error('Nenhuma próxima faixa disponível');
    }
  });

  MusicControl.on(Command.previousTrack, () => {
    console.log('Notificação: Música anterior pressionada');
    const previousTrack = getCurrentTrack('previous'); // Obtém a música anterior

    if (previousTrack) {
      setupMusicControl(); // Atualiza as informações da notificação
      playCurrentSong(previousTrack); // Toca a música anterior
    } else {
      console.error('Nenhuma música anterior disponível');
    }
  });
};
