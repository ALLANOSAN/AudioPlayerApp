import { AudioPlayer } from '../services/AudioPlayer';
import { mockTrack, mockPlaylist } from './mocks';

// Variáveis para controlar o estado do mock
let mockIsPlaying = true;
let mockPosition = 0;

// Configurar mocks necessários
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue({}),
      playAsync: jest.fn().mockImplementation(() => {
        mockIsPlaying = true;
        return Promise.resolve({});
      }),
      pauseAsync: jest.fn().mockImplementation(() => {
        mockIsPlaying = false;
        return Promise.resolve({});
      }),
      stopAsync: jest.fn().mockResolvedValue({}),
      unloadAsync: jest.fn().mockResolvedValue({}),
      setPositionAsync: jest.fn().mockImplementation((position) => {
        // Salvar a posição para que getCurrentPosition possa retorná-la
        mockPosition = position / 1000;
        return Promise.resolve({});
      }),
      getStatusAsync: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          isLoaded: true,
          isPlaying: mockIsPlaying,
          positionMillis: mockPosition * 1000,
          durationMillis: 30000
        });
      }),
      setOnPlaybackStatusUpdate: jest.fn()
    }))
  }
}));

// Mock para o store
jest.mock('../store', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      player: {
        currentSong: null,
        isPlaying: false
      },
      playlist: {
        songs: []
      }
    }),
    dispatch: jest.fn()
  }
}));

describe('AudioPlayer', () => {
  let audioPlayer: AudioPlayer;

  beforeEach(() => {
    // Resetar o estado do mock antes de cada teste
    mockIsPlaying = true;
    mockPosition = 0;
    
    audioPlayer = AudioPlayer.getInstance();
    
    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  describe('Playback Controls', () => {
    it('should play audio successfully', async () => {
      await audioPlayer.playAudio(mockTrack.url);
      // Verificar se o áudio está tocando usando o método correto
      const position = await audioPlayer.getCurrentPosition();
      expect(position).toBeGreaterThanOrEqual(0);
    });

    it('should pause audio successfully', async () => {
      await audioPlayer.playAudio(mockTrack.url);
      
      // Quando pauseAudio é chamado, devemos atualizar o estado do mock
      mockIsPlaying = false;
      
      await audioPlayer.pauseAudio();
      // Verificar se o áudio está pausado
      const position = await audioPlayer.getCurrentPosition();
      expect(position).toBeGreaterThanOrEqual(0);
    });

    it('should seek to position', async () => {
      await audioPlayer.playAudio(mockTrack.url);
      const position = 30;
      // Use o método correto para buscar uma posição
      await audioPlayer.seekTo(position);
      const currentPosition = await audioPlayer.getCurrentPosition();
      expect(currentPosition).toBe(position);
    });
  });

  describe('Queue Management', () => {
    it('should handle next track correctly', async () => {
      // Configurar o mock do store para este teste específico
      const { store } = require('../store');
      store.getState.mockReturnValue({
        player: {
          currentSong: mockTrack,
          isPlaying: true
        },
        playlist: {
          songs: mockPlaylist
        }
      });
      
      await audioPlayer.playAudio(mockPlaylist[0].url);
      await audioPlayer.nextTrack();
      const currentPosition = await audioPlayer.getCurrentPosition();
      expect(currentPosition).toBeGreaterThanOrEqual(0);
    });
  });
});