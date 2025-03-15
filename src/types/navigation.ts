// Definição dos tipos para navegação no aplicativo
import { Song } from './song';
import { Artist } from './artist';
import { Playlist } from './playlist';
import { Album } from './album';

// Definição das rotas e parâmetros para o Stack Navigator
export type RootStackParamList = {
  Tabs: undefined; // Rota para o TabNavigator, sem parâmetros
  Player: {
    song: Song; // Rota para o Player, com parâmetro song
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