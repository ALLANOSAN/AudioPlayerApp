export interface Song {
    id: string;
    name: string;
    artist: string;
    album?: string; // Adicione esta linha
    artwork?: string;
    duration?: number;
    path?: string;
    // ...outras propriedades
  }
  
  export interface Artist {
    id: string;
    name: string;
    artwork?: string;
    songs?: Song[];
  }
  
  export interface Album {
    id: string;
    name: string;
    artist: string;
    artistId?: string;
    artwork?: string;
    songs: Song[];
  }
  
  export interface Playlist {
    id: string;
    name: string;
    songs: Song[];
    artwork?: string;
  }