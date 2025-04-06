import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlayerState } from './types';
import { Song } from '../types/song';

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  buffered: 0
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong(state, action: PayloadAction<Song>) {
      state.currentSong = action.payload;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setBuffered(state, action: PayloadAction<number>) {
      state.buffered = action.payload;
    }
  }
});

export const { 
  setCurrentSong, 
  setIsPlaying, 
  setCurrentTime, 
  setDuration, 
  setBuffered 
} = playerSlice.actions;

export default playerSlice.reducer;