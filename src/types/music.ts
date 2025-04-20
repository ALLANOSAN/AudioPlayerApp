export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    artwork?: string;
    duration?: number;
  }
  
  export interface Artist {
    id: string;
    name: string;
    image?: string;
    songs?: Song[];
  }
  
  export interface Album {
    id: string;
    title: string;
    artist: string;
    artistId?: string;
    artwork?: string;
    songs: Song[];
  }
  
  export interface Playlist {
    id: string;
    name: string;
    songs: Song[];
    coverImage?: string;
  }