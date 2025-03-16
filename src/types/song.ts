// src/types/Song.ts
export interface Song {
  path: string; // Caminho do arquivo, usado como ID único
  name: string; // Nome da música
  artist: string; // Nome do artista
  cover: string; // Caminho ou URL para a capa do álbum
  album: string; // Nome do álbum
}