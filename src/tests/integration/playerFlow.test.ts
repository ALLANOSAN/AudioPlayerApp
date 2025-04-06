import { AudioPlayer } from '../../services/AudioPlayer';
import { NotificationService } from '../../services/NotificationService';
import { mockTrack, mockPlaylist } from '../mocks';
import { setCurrentSong, setIsPlaying } from '../../store/playerSlice';

// Mock para playerSlice
jest.mock('../../store/playerSlice', () => ({
  setCurrentSong: jest.fn().mockImplementation((song) => ({ 
    type: 'player/setCurrentSong',
    payload: song
  })),
  setIsPlaying: jest.fn().mockImplementation((isPlaying) => ({ 
    type: 'player/setIsPlaying',
    payload: isPlaying
  }))
}));

describe('Player Integration', () => {
  let player: AudioPlayer;
  let notification: NotificationService;
  let mockStore: any;

  beforeEach(() => {
    // Criar um mock do store para cada teste
    mockStore = {
      getState: jest.fn().mockReturnValue({
        player: {
          currentSong: mockTrack,
          isPlaying: true
        },
        playlist: {
          songs: mockPlaylist
        }
      }),
      dispatch: jest.fn()
    };
    
    // Injetar o mock do store na instância do AudioPlayer
    player = AudioPlayer.getInstance(mockStore);
    notification = NotificationService.getInstance();
    
    // Resetar os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should update notification when track changes', async () => {
    await player.playAudio(mockTrack.url, mockTrack.title, mockTrack.artist);
    
    // Verificar se dispatch foi chamado com setIsPlaying(true)
    expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
      type: 'player/setIsPlaying',
      payload: true
    }));
  });

  it('should handle playlist navigation', async () => {
    // Configurar o mock para retornar valores diferentes em chamadas sucessivas
    mockStore.getState
      // Primeira chamada em nextTrack para obter currentSong
      .mockReturnValueOnce({
        player: {
          currentSong: mockTrack,
          isPlaying: true
        },
        playlist: {
          songs: mockPlaylist
        }
      })
      // Segunda chamada em nextTrack para obter playlist
      .mockReturnValueOnce({
        player: {
          currentSong: mockTrack,
          isPlaying: true
        },
        playlist: {
          songs: mockPlaylist
        }
      });
    
    await player.playAudio(mockPlaylist[0].url);
    
    // Limpar as chamadas anteriores para ter um teste mais limpo
    mockStore.dispatch.mockClear();
    
    await player.nextTrack();
    
    // Verificar se dispatch foi chamado com setCurrentSong
    expect(mockStore.dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
      type: 'player/setCurrentSong'
    }));
  });
});