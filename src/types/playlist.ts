// Definição dos tipos relacionados a playlists
import { Song } from './song';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export interface PlaylistSong extends Song {
  // Campos adicionais específicos para músicas em playlists, se necessário
}

// Estado para o gerenciamento de playlists
export interface PlaylistState {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  selectedSong: Song | null;
  modalVisible: boolean;
  editMode: boolean;
  playlistName: string;
  message: string;
} 