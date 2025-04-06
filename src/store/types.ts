import { Song } from '../types/song';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
}

export interface PlaylistState {
  songs: Song[];
  currentIndex: number;
}

export interface RootState {
  player: PlayerState;
  playlist: PlaylistState;
}