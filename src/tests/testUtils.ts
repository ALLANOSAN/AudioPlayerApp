import React from 'react';
import { render } from '@testing-library/react-native';
import { configureStore } from '@reduxjs/toolkit';
import playerReducer from '../store/playerSlice';
import playlistReducer from '../store/playlistSlice';

const testStore = configureStore({
  reducer: {
    player: playerReducer,
    playlist: playlistReducer
  }
});

export function renderWithRedux(component: React.ReactElement) {
  return {
    ...render(component),
    store: testStore
  };
}