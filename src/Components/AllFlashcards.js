import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { deleteFlashcard } from '../features/flashcards/flashcardsSlice'; // Ensure correct import path

const truncateText = (text, length) => {
  if (!text) {
    return '';
  }
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + '...';
};

const AllFlashcards = () => {
  const flashcards = useSelector((state) => state.flashcards);
  const dispatch = useDispatch();
  const [imageData, setImageData] = useState({});

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
  };

  const fetchImageAsBase64 = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64Image = await blobToBase64(blob);
      return base64Image;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const updatedImageData = {};
      for (let index = 0; index < flashcards.length; index++) {
        const flashcard = flashcards[index];
        if (flashcard.image) {
          const base64Image = await fetchImageAsBase64(flashcard.image);
          if (base64Image) {
            updatedImageData[index] = base64Image;
          }
        }
      }
      setImageData(updatedImageData);
    };

    fetchImages();
  }, [flashcards, fetchImageAsBase64]); // Added fetchImageAsBase64 to dependencies

  const handleDelete = (index) => {
    dispatch(deleteFlashcard(index));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6 text-center">All Flashcards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {flashcards.map((flashcard, index) => {
          const base64Image = imageData[index];
          const truncatedDescription = truncateText(flashcard.description, 100);

          return (
            <div key={index} className="p-4 bg-white shadow-md rounded-lg relative flex flex-col items-center">
              {base64Image && (
                <div className="flex justify-center mb-4">
                  <img
                    src={base64Image}
                    alt="Flashcard"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                </div>
              )}
              <div className="text-lg font-semibold mb-2 text-center">{flashcard.group}</div>
              <p className="text-gray-700 mb-4 text-center">{truncatedDescription}</p>
              <div className="text-sm text-gray-500 mb-2 text-center">{flashcard.terms.length} Cards</div>
              <Link to={`/view-card/${index}`} className="text-red-600 border border-red-600 px-4 py-2 rounded-md mt-auto">
                View Cards
              </Link>
              <button
                onClick={() => handleDelete(index)}
                className="absolute top-2 right-2 text-red-600"
              >
                <FaTrash />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllFlashcards;
