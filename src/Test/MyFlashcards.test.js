import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MyFlashcards from './MyFlashcards';
import { deleteFlashcard } from '../features/flashcards/flashcardsSlice';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

jest.mock('react-icons/fa', () => ({
  FaTrash: () => <span>TrashIcon</span>,
}));

jest.mock('../features/flashcards/flashcardsSlice', () => ({
  deleteFlashcard: jest.fn().mockImplementation((index) => ({ type: 'deleteFlashcard', payload: index })),
}));

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('MyFlashcards', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      flashcards: [
        { group: 'Group 1', description: 'Description 1', terms: ['Term1'], image: 'http://example.com/image1.jpg' },
        { group: 'Group 2', description: 'Description 2', terms: ['Term2'], image: 'http://example.com/image2.jpg' },
        // Add more flashcards as needed for testing
      ],
    };
    store = mockStore(initialState);
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MyFlashcards />
      </Provider>
    );

  test('renders the component with flashcards', () => {
    renderComponent();
    expect(screen.getByText('My Flashcards')).toBeInTheDocument();
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('1 Cards')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('1 Cards')).toBeInTheDocument();
  });

  test('handles delete button click', async () => {
    renderComponent();
    fireEvent.click(screen.getAllByText('TrashIcon')[0]);
    await waitFor(() => expect(deleteFlashcard).toHaveBeenCalledWith(0));
  });

  test('handles show all button click', () => {
    renderComponent();
    fireEvent.click(screen.getByText('See All'));
    expect(screen.queryByText('See All')).not.toBeInTheDocument();
  });

  test('fetches images and displays them', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation((url) =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob([url], { type: 'image/jpeg' })),
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://example.com/image1.jpg');
      expect(fetchMock).toHaveBeenCalledWith('http://example.com/image2.jpg');
    });

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
    });
  });

  test('handles error in image fetching', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject('Fetch error')
    );
    renderComponent();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(screen.queryByAltText('Flashcard')).not.toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
