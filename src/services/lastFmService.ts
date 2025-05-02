import axios from 'axios';
import Config from 'react-native-config';

const BASE_URL = Config.LASTFM_API_BASE_URL || 'http://ws.audioscrobbler.com/2.0';
const API_KEY = Config.LASTFM_API_KEY;

export const lastFmService = {
  // Adicionamos este método que é chamado do SongsScreen
  fetchSongInfo: async (
    songName: string
  ): Promise<{ title: string; artist: string; cover: string }> => {
    try {
      const trackResponse = await axios.get(
        `${BASE_URL}/?method=track.search&track=${encodeURIComponent(songName)}&api_key=${API_KEY}&format=json`
      );
      const tracks = trackResponse.data.results?.trackmatches?.track || [];

      if (tracks.length === 0) {
        return { title: songName, artist: 'Artista Desconhecido', cover: '' };
      }

      const track = tracks[0];
      const artist = track.artist;

      const albumResponse = await axios.get(
        `${BASE_URL}/?method=artist.gettopalbums&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&format=json`
      );
      const albums = albumResponse.data.topalbums?.album || [];
      const cover = albums.length > 0 ? albums[0].image[3]['#text'] : '';

      return {
        title: track.name || songName,
        artist: artist || 'Artista Desconhecido',
        cover: cover,
      };
    } catch (error) {
      console.error('Erro ao buscar informações da música:', error);
      return { title: songName, artist: 'Artista Desconhecido', cover: '' };
    }
  },

  searchTrack: async (songName: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/?method=track.search&track=${encodeURIComponent(songName)}&api_key=${API_KEY}&format=json`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar informações da música:', error);
      throw error;
    }
  },
  
  getArtistTopAlbums: async (artist: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/?method=artist.gettopalbums&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&format=json`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar álbuns do artista:', error);
      throw error;
    }
  }
};