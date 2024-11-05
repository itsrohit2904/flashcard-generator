import { configureStore } from '@reduxjs/toolkit';
import flashcardsReducer from '../features/flashcards/flashcardsSlice.js';

export const store = configureStore({
  reducer: {
    flashcards: flashcardsReducer,
  },
});
