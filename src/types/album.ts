// Definição do tipo Album para uso em todo o aplicativo
import { Song } from './song';

export interface Album {
  id: string;
  name: string;
  artist: string;
  cover?: string;
  songs: Song[];
} 