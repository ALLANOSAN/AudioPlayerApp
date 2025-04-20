import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlaylistState } from './types';
import { Song } from '../types/music';

const initialState: PlaylistState = {
  songs: [],
  currentIndex: 0
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setSongs(state, action: PayloadAction<Song[]>) {
      state.songs = action.payload;
    },
    setCurrentIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;
    }
  }
});

export const { setSongs, setCurrentIndex } = playlistSlice.actions;
export default playlistSlice.reducer;
