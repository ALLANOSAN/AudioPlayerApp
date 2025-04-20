import { createSelector } from 'reselect';
import { RootState } from './types';
import { Song } from '../types/music';

const getPlayerState = (state: RootState) => state.player;
const getPlaylistState = (state: RootState) => state.playlist;

export const getCurrentTrack = createSelector(
  getPlayerState,
  (player) => player.currentSong
);

export const getPlaybackStatus = createSelector(
  getPlayerState,
  (player) => ({
    isPlaying: player.isPlaying,
    currentTime: player.currentTime,
    duration: player.duration,
    buffered: player.buffered
  })
);

export const getQueueInfo = createSelector(
  [getPlayerState, getPlaylistState],
  (player, playlist) => ({
    currentIndex: playlist.songs.findIndex((song: Song) => song.id === player.currentSong?.id),
    totalSongs: playlist.songs.length,
    nextSong: playlist.songs[playlist.songs.findIndex((song: Song) => song.id === player.currentSong?.id) + 1],
    previousSong: playlist.songs[playlist.songs.findIndex((song: Song) => song.id === player.currentSong?.id) - 1]
  })
);