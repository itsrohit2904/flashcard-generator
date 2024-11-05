import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FlashcardForm from '../Components/FlashcardForm';
import { addFlashcard } from '../features/flashcards/flashcardsSlice';

jest.mock('../features/flashcards/flashcardsSlice', () => ({
  addFlashcard: jest.fn(),
}));

const mockStore = configureStore([]);

const renderComponent = (initialState = {}) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <FlashcardForm />
    </Provider>
  );
};

describe('FlashcardForm', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      flashcards: [],
    });
  });

  test('should render the FlashcardForm component correctly', () => {
    renderComponent();
    expect(screen.getByText(/Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  test('should have the correct initial state', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Select or enter new group/i)).toHaveValue('');
    expect(screen.getByText(/Save/i)).toBeDisabled();
  });

  test('should show an error message if the group field is left empty on submit', () => {
    renderComponent();
    fireEvent.click(screen.getByText(/Save/i));
    expect(screen.getByText(/Group is required/i)).toBeInTheDocument();
  });

  test('should show an error message if the description field is left empty and the group is new', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.click(screen.getByText(/Save/i));
    expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
  });

  test('should show an error message if any term or definition field is left empty on submit', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.change(screen.getByPlaceholderText(/Term/i), { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText(/Definition/i), { target: { value: '' } });
    fireEvent.click(screen.getByText(/Save/i));
    expect(screen.getByText(/Term is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Definition is required/i)).toBeInTheDocument();
  });

  test('should add more terms when the "Add More Terms" button is clicked', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.click(screen.getByText(/Add More Terms/i));
    expect(screen.getAllByPlaceholderText(/Term/i)).toHaveLength(2);
  });

  test('should delete the correct term when the delete button is clicked', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.click(screen.getByText(/Add More Terms/i));
    fireEvent.click(screen.getAllByText(/Delete/i)[0]);
    expect(screen.getAllByPlaceholderText(/Term/i)).toHaveLength(1);
  });

  test('should update the newGroupImage state when an image is uploaded for the group', async () => {
    renderComponent();
    const file = new File(['group-image'], 'group-image.png', { type: 'image/png' });

    fireEvent.change(screen.getByLabelText(/Upload Image/i), { target: { files: [file] } });
    
    // Ensure the image was processed
    await waitFor(() => {
      expect(screen.getByAltText(/Group/i)).toBeInTheDocument();
    });
  });

  test('should update the image of the correct term when an image is uploaded for a term', async () => {
    renderComponent();
    const file = new File(['term-image'], 'term-image.png', { type: 'image/png' });

    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.change(screen.getAllByLabelText(/Select Image/i)[0], { target: { files: [file] } });

    // Ensure the image was processed
    await waitFor(() => {
      expect(screen.getByAltText(/Term 1/i)).toBeInTheDocument();
    });
  });

  test('should dispatch addFlashcard action with correct data when the form is submitted with valid data', () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.change(screen.getByPlaceholderText(/Term/i), { target: { value: 'New Term' } });
    fireEvent.change(screen.getByPlaceholderText(/Definition/i), { target: { value: 'New Definition' } });
    fireEvent.click(screen.getByText(/Save/i));

    expect(addFlashcard).toHaveBeenCalledWith({
      group: 'New Group',
      description: '',
      terms: [{ term: 'New Term', definition: 'New Definition', image: null }],
      image: null,
    });
  });

  test('should show a success message on successful form submission', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.change(screen.getByPlaceholderText(/Term/i), { target: { value: 'New Term' } });
    fireEvent.change(screen.getByPlaceholderText(/Definition/i), { target: { value: 'New Definition' } });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(screen.getByText(/Flashcard updated\/created successfully!/i)).toBeInTheDocument();
    });
  });

  test('should clear the form fields after successful submission', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'New Group' } });
    fireEvent.change(screen.getByPlaceholderText(/Term/i), { target: { value: 'New Term' } });
    fireEvent.change(screen.getByPlaceholderText(/Definition/i), { target: { value: 'New Definition' } });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Select or enter new group/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/Term/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/Definition/i)).toHaveValue('');
    });
  });

  test('should disable description field if an existing group is selected', () => {
    const existingGroupState = {
      flashcards: [{ group: 'Existing Group', description: 'Existing Description', terms: [] }],
    };
    renderComponent(existingGroupState);

    fireEvent.change(screen.getByPlaceholderText(/Select or enter new group/i), { target: { value: 'Existing Group' } });
    expect(screen.getByPlaceholderText(/Description/i)).toBeDisabled();
  });

  test('should disable certain buttons when group field is empty', () => {
    renderComponent();
    expect(screen.getByText(/Add More Terms/i)).toBeDisabled();
    expect(screen.getByText(/Save/i)).toBeDisabled();
  });
});
