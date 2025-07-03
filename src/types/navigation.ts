// Definição dos tipos para navegação no aplicativo
import { Song, Artist, Playlist, Album } from './music';
import { RouteProp } from '@react-navigation/native';

// Definição das rotas e parâmetros para o Stack Navigator
export type RootStackParamList = {
  MainTabs: undefined; // Corrigido: nome igual ao usado no Stack.Screen
  Player: {
    song: Song; // Rota para o Player, com parâmetro song
    playlist: Song[];
    songIndex: number; // Corrigido: adiciona songIndex
  };
  ArtistDetails: {
    artist: Artist; // Rota para detalhes do artista
  };
  PlaylistDetails: {
    playlist: Playlist; // Rota para detalhes da playlist
  };
  AlbumDetails: {
    album: Album; // Rota para detalhes do álbum
  };
};

// Definição das rotas e parâmetros para o Tab Navigator
export type TabParamList = {
  Music: undefined;
  Albums: undefined;
  Artists: undefined;
  Playlists: undefined;
  Settings: undefined;
};

export type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
