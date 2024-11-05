import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import ShareModal from './ShareModal';
import { FaDownload, FaPrint, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { BiShareAlt } from 'react-icons/bi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ViewCard.css'

const ViewCard = () => {
  const { index } = useParams();
  const flashcard = useSelector((state) => state.flashcards[index]);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageData, setImageData] = useState({});

  // Memoize fetchImageAsBase64 function
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

  useEffect(() => {
    if (flashcard) {
      const fetchImages = async () => {
        const termImage = flashcard.terms[currentTermIndex].image;
        if (termImage) {
          const base64Image = await fetchImageAsBase64(termImage);
          if (base64Image) {
            setImageData((prevData) => ({
              ...prevData,
              [currentTermIndex]: base64Image,
            }));
          }
        }
      };
      fetchImages();
    }
  }, [flashcard, currentTermIndex, fetchImageAsBase64]); // Added fetchImageAsBase64 to dependencies

  if (!flashcard) {
    return <div className="container mx-auto p-8">Flashcard not found.</div>;
  }

  const handleShare = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'pt', 'letter');
  
    // Add group name
    doc.setFontSize(24);
    doc.text(flashcard.group, 40, 50, { align: 'center' });
  
    // Add group image
    if (flashcard.image) {
      doc.addImage(flashcard.image, 'JPEG', 100, 80, 400, 250); // Adjust positioning and size as needed
    }
  
    // Add group description
    doc.setFontSize(14);
    doc.text(flashcard.description, 40, 360, { align: 'justify', maxWidth: 500 });
  
    // Add terms
    let startY = 420; // Adjust starting Y position for terms
  
    flashcard.terms.forEach((term, index) => {
      if (index > 0) {
        doc.addPage(); // Add new page for each term
        startY = 40; // Reset startY for new page
      }
  
      // Term name
      doc.setFontSize(16);
      doc.text(`Term ${index + 1}: ${term.term}`, 40, startY, { maxWidth: 500 });
  
      // Term definition
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(term.definition, 500);
      doc.text(splitText, 40, startY + 20);
  
      // Term image
      if (term.image) {
        doc.addImage(term.image, 'JPEG', 100, startY + 80, 400, 250); // Adjust positioning and size as needed
      }
  
      startY += 350; // Adjust for next term
    });
  
    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save('flashcards.pdf');
  };

  const handlePrint = () => {
    const doc = generatePDF();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleNext = () => {
    setCurrentTermIndex((prevIndex) => (prevIndex + 1) % flashcard.terms.length);
  };

  const handlePrevious = () => {
    setCurrentTermIndex((prevIndex) => (prevIndex - 1 + flashcard.terms.length) % flashcard.terms.length);
  };

  const base64Image = imageData[currentTermIndex];

  return (
    <div className="container mx-auto p-8 bg-slate-100">
      <div className=" container flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link to="/my-flashcards" className="text-red-500 hover:underline flex items-center">
            <span className="text-2xl">&larr;</span>
          </Link>
          <h1 className="text-2xl font-semibold ml-2">{flashcard.group}</h1>
        </div>
      </div>
      <p className="mb-8 text-left">{flashcard.description}</p>
      <div className="md:flex">
        <div className="md:w-1/4 ">
          <div className="bg-white p-4 shadow-md rounded-lg h-90 overflow-y-auto flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Flashcards</h2>
            {flashcard.terms.map((term, i) => (
              <p
                key={i}
                className={`mb-2 cursor-pointer ${i === currentTermIndex ? 'text-red-500' : ''}`}
                onClick={() => setCurrentTermIndex(i)}
              >
                {term.term}
              </p>
            ))}
          </div>
        </div>
        <div className="md:w-3/4 md:pl-8 mt-2 md:mt-0">
          {flashcard.terms.length > 0 && (
            <div className="bg-white p-8 shadow-md rounded-lg md:flex">
              {base64Image && (
                <div className='md:w-1/2 h-60 flex justify-center items-center'>
                  <img
                    src={base64Image}
                    alt="Term"
                    className="mr-4 object-cover w-[250px] h-[250px] m-4" // Increased size to 300px by 300px
                  />
                </div>
              )}
              <div className="md:w-1/2">
                <p className="text-gray-700">{flashcard.terms[currentTermIndex].definition}</p>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevious}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
              disabled={flashcard.terms.length === 1}
            >
              <FaArrowLeft />
            </button>
            <span className="text-gray-700">
              {currentTermIndex + 1} / {flashcard.terms.length}
            </span>
            <button
              onClick={handleNext}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
              disabled={flashcard.terms.length === 1}
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
        <div className="md:ml-8 flex flex-col items-center md:justify-start space-y-4 md:h-[150px]">
          <button onClick={handleShare} className="flex items-center bg-white text-gray-600 py-2 px-4 rounded-md border border-gray-300 w-[140px]">
            <BiShareAlt className="mr-2" /> {/* Updated Share Icon */}
            Share
          </button>
          <button onClick={handleDownload} className="flex items-center bg-white text-gray-600 py-2 px-4 rounded-md border border-gray-300 w-[140px]">
            <FaDownload className="mr-2" /> {/* Download Icon */}
            Download
          </button>
          <button onClick={handlePrint} className="flex items-center bg-white text-gray-600 py-2 px-4 rounded-md border border-gray-300 w-[140px]">
            <FaPrint className="mr-2" /> {/* Print Icon */}
            Print
          </button>
        </div>
      </div>
      <ShareModal isOpen={isModalOpen} onClose={handleCloseModal} url={window.location.href} />
    </div>
  );
};

export default ViewCard;
