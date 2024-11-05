import { createSlice } from '@reduxjs/toolkit';

const loadFlashcardsFromLocalStorage = () => {
  const flashcards = localStorage.getItem('flashcards');
  return flashcards ? JSON.parse(flashcards) : [];
};

const saveFlashcardsToLocalStorage = (flashcards) => {
  localStorage.setItem('flashcards', JSON.stringify(flashcards));
};

const flashcardsSlice = createSlice({
  name: 'flashcards',
  initialState: loadFlashcardsFromLocalStorage(),
  reducers: {
    addFlashcard: (state, action) => {
      const existingIndex = state.findIndex(flashcard => flashcard.group === action.payload.group);

      if (existingIndex !== -1) {
        // If the group already exists, append the new terms to the existing terms
        state[existingIndex].terms = [
          ...state[existingIndex].terms,
          ...action.payload.terms,
        ];
      } else {
        // If the group does not exist, add the new flashcard
        state.push(action.payload);
      }
      
      saveFlashcardsToLocalStorage(state);
    },
    deleteFlashcard: (state, action) => {
      const updatedState = state.filter((_, index) => index !== action.payload);
      saveFlashcardsToLocalStorage(updatedState);
      return updatedState;
    },
    // You can add other reducers as needed
  },
});

export const { addFlashcard, deleteFlashcard } = flashcardsSlice.actions;
export default flashcardsSlice.reducer;