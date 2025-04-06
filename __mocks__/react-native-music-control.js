const MusicControl = {
  enableBackgroundMode: jest.fn(),
  enableControl: jest.fn(),
  handleAudioInterruptions: jest.fn(),
  updatePlayback: jest.fn(),
  setNowPlaying: jest.fn(),
  resetNowPlaying: jest.fn(),
  on: jest.fn(),
  STATE_PLAYING: 'playing',
  STATE_PAUSED: 'paused'
};

const Command = {
  play: 'play',
  pause: 'pause',
  stop: 'stop',
  nextTrack: 'nextTrack',
  previousTrack: 'previousTrack'
};

module.exports = MusicControl;
module.exports.Command = Command;