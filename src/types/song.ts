// Definição do tipo Song para uso em todo o aplicativo
export interface Song {
  path: string;
  name: string;
  artist: string;
  cover: string;
  album: string; // Tornando obrigatório para compatibilidade
} 