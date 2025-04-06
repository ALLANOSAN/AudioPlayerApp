// Mock para playerSlice
jest.mock('./src/store/playerSlice', () => ({
  setCurrentSong: jest.fn().mockImplementation((song) => ({ 
    type: 'player/setCurrentSong',
    payload: song
  })),
  setIsPlaying: jest.fn().mockImplementation((isPlaying) => ({ 
    type: 'player/setIsPlaying',
    payload: isPlaying
  })),
  setCurrentTime: jest.fn().mockImplementation((time) => ({ 
    type: 'player/setCurrentTime',
    payload: time
  })),
  setDuration: jest.fn().mockImplementation((duration) => ({ 
    type: 'player/setDuration',
    payload: duration
  }))
}));

// Mock para expo-av
jest.mock('expo-av', () => {
  let mockIsPlaying = true;
  let mockPosition = 0;
  
  return {
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
      })),
      setAudioModeAsync: jest.fn().mockResolvedValue({})
    }
  };
});

// Mock para NotificationService
jest.mock('./src/services/NotificationService', () => ({
  NotificationService: {
    getInstance: jest.fn().mockReturnValue({
      updatePlaybackState: jest.fn(),
      updateNotificationMetadata: jest.fn(),
      resetNotification: jest.fn(),
      setup: jest.fn().mockResolvedValue({}),
      updatePlaybackControls: jest.fn(),
      updateMetadata: jest.fn(),
      resetNotificationControls: jest.fn()
    })
  }
}));

// Outros mocks que você possa precisar...
