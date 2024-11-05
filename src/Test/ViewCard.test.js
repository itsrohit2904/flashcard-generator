import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ViewCard from '../Components/ViewCard';
import ShareModal from '../Components/ShareModal';
import jsPDF from 'jspdf';

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    addPage: jest.fn(),
    setFontSize: jest.fn(),
    splitTextToSize: jest.fn(),
  }));
});

jest.mock('../Components/ShareModal', () => jest.fn(() => null));

const mockStore = configureStore([]);

const renderWithRouterAndStore = (store, initialEntries) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/view/:index" component={ViewCard} />
      </MemoryRouter>
    </Provider>
  );
};

describe('ViewCard Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      flashcards: [
        {
          group: 'Sample Group',
          description: 'Sample Description',
          image: 'sample-group-image.jpg',
          terms: [
            { term: 'Term 1', definition: 'Definition 1', image: 'term1-image.jpg' },
            { term: 'Term 2', definition: 'Definition 2', image: 'term2-image.jpg' },
          ],
        },
      ],
    });
  });

  test('should render the ViewCard component correctly', () => {
    renderWithRouterAndStore(store, ['/view/0']);

    expect(screen.getByText('Sample Group')).toBeInTheDocument();
    expect(screen.getByText('Sample Description')).toBeInTheDocument();
    expect(screen.getByText('Term 1')).toBeInTheDocument();
    expect(screen.getByText('Definition 1')).toBeInTheDocument();
  });

  test('should handle next and previous buttons correctly', () => {
    renderWithRouterAndStore(store, ['/view/0']);

    // Initially showing Term 1
    expect(screen.getByText('Term 1')).toBeInTheDocument();
    expect(screen.getByText('Definition 1')).toBeInTheDocument();

    // Click next button
    fireEvent.click(screen.getByRole('button', { name: /arrow-right/i }));

    // Now showing Term 2
    expect(screen.getByText('Term 2')).toBeInTheDocument();
    expect(screen.queryByText('Definition 2')).toBeInTheDocument();

    // Click previous button
    fireEvent.click(screen.getByRole('button', { name: /arrow-left/i }));

    // Back to Term 1
    expect(screen.getByText('Term 1')).toBeInTheDocument();
    expect(screen.queryByText('Definition 1')).toBeInTheDocument();
  });

  test('should open and close ShareModal', () => {
    renderWithRouterAndStore(store, ['/view/0']);

    // Simulate share button click
    fireEvent.click(screen.getByText(/share/i));

    // ShareModal should be opened
    expect(ShareModal).toHaveBeenCalledWith(
      expect.objectContaining({ isOpen: true }),
      expect.anything()
    );

    // Simulate modal close
    fireEvent.click(screen.getByText(/close/i)); // Adjust selector according to your ShareModal's close button
    expect(ShareModal).toHaveBeenCalledWith(
      expect.objectContaining({ isOpen: false }),
      expect.anything()
    );
  });

  test('should generate and download PDF when the download button is clicked', async () => {
    renderWithRouterAndStore(store, ['/view/0']);

    // Simulate download button click
    fireEvent.click(screen.getByText(/download/i));

    // Verify that the PDF generation functions were called
    await waitFor(() => {
      expect(jsPDF).toHaveBeenCalled();
      expect(jsPDF().addImage).toHaveBeenCalled();
      expect(jsPDF().text).toHaveBeenCalled();
      expect(jsPDF().save).toHaveBeenCalledWith('flashcards.pdf');
    });
  });

  test('should generate and print PDF when the print button is clicked', async () => {
    renderWithRouterAndStore(store, ['/view/0']);

    // Mock window.open
    const mockWindowOpen = jest.fn();
    global.window.open = mockWindowOpen;

    // Simulate print button click
    fireEvent.click(screen.getByText(/print/i));

    // Verify that the PDF generation functions were called
    await waitFor(() => {
      expect(jsPDF).toHaveBeenCalled();
      expect(jsPDF().addImage).toHaveBeenCalled();
      expect(jsPDF().text).toHaveBeenCalled();
    });

    // Verify that window.open was called with the blob URL
    expect(mockWindowOpen).toHaveBeenCalled();
  });

  test('should show "Flashcard not found" message for invalid index', () => {
    renderWithRouterAndStore(store, ['/view/999']);

    expect(screen.getByText('Flashcard not found.')).toBeInTheDocument();
  });
});
