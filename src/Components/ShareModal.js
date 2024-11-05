import React, { useRef } from 'react';
import { FaFacebook, FaLinkedin, FaWhatsapp, FaTwitter, FaEnvelope, FaCopy } from 'react-icons/fa';

const ShareModal = ({ isOpen, onClose, url }) => {
  const inputRef = useRef(null);

  const handleInputFocus = (event) => {
    event.target.select();
  };

  const copyToClipboard = () => {
    inputRef.current.select();
    document.execCommand('copy');
    alert('Copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <div className="container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <span className="material-icons">&#x2715;</span>
        </button>
        <h2 className="text-xl font-semibold mb-4">Share</h2>
        <div className="mb-4 relative">
          <input
            ref={inputRef}
            type="text"
            value={url}
            readOnly
            onFocus={handleInputFocus}
            className="w-full p-2 pr-10 border rounded-md text-gray-600"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
          >
            <FaCopy className="text-lg" />
          </button>
        </div>
        <div className="flex justify-around mb-4">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noopener noreferrer">
            <FaFacebook className="text-blue-600 text-2xl" />
          </a>
          <a href={`https://www.linkedin.com/shareArticle?url=${url}`} target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="text-blue-700 text-2xl" />
          </a>
          <a href={`https://api.whatsapp.com/send?text=${url}`} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="text-green-500 text-2xl" />
          </a>
          <a href={`https://twitter.com/share?url=${url}`} target="_blank" rel="noopener noreferrer">
            <FaTwitter className="text-blue-400 text-2xl" />
          </a>
          <a href={`mailto:?body=${encodeURIComponent(`Check out this link: ${url}`)}`} target="_blank" rel="noopener noreferrer">
            <FaEnvelope className="text-gray-500 text-2xl" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
