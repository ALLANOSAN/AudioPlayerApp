import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Song } from '../../types/music';

interface SongsState {
  allSongs: Song[];
}

const initialState: SongsState = {
  allSongs: [],
};

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    addSongs(state, action: PayloadAction<Song[]>) {
      state.allSongs.push(...action.payload);
    },
    removeSongs(state, action: PayloadAction<string[]>) {
      state.allSongs = state.allSongs.filter(song => !action.payload.includes(song.id));
    },
  },
});

export const { addSongs, removeSongs } = songsSlice.actions;
export type RootState = { songs: SongsState };
export default songsSlice.reducer;