export interface Song {
    id: string;
    name: string;
    artist: string;
    path: string;
    artwork?: string;
    duration?: number;
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