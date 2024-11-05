import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFlashcard } from '../features/flashcards/flashcardsSlice';
import { FaUpload, FaTrash, FaEdit } from 'react-icons/fa';

const FlashcardForm = () => {
  const [group, setGroup] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState([{ term: '', definition: '', image: null }]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [newGroupImage, setNewGroupImage] = useState(null);
  const dispatch = useDispatch();
  const flashcards = useSelector((state) => state.flashcards);
  const isExistingGroup = flashcards.some(flashcard => flashcard.group === group);


  const handleTermChange = (index, event) => {
    const newTerms = terms.map((term, termIndex) => {
      if (termIndex === index) {
        return { ...term, [event.target.name]: event.target.value };
      }
      return term;
    });
    setTerms(newTerms);
  };

  const handleTermImageChange = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await toBase64(file);
      const newTerms = terms.map((term, termIndex) => {
        if (termIndex === index) {
          term.image = base64Image;
          return term;
        }
        return term;
      });
      setTerms(newTerms);
    }
  };

  const handleGroupImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await toBase64(file);
      setNewGroupImage(base64Image);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const addMoreTerms = () => {
    setTerms([...terms, { term: '', definition: '', image: null }]);
  };

  const deleteTerm = (index) => {
    const newTerms = terms.filter((_, termIndex) => termIndex !== index);
    setTerms(newTerms);
  };

  const validate = () => {
    const newErrors = {};
    if (!group) newErrors.group = 'Group is required';
    if (flashcards.every(flashcard => flashcard.group !== group) && !description) {
      newErrors.description = 'Description is required';
    }
    terms.forEach((term, index) => {
      if (!term.term) newErrors[`term-${index}`] = 'Term is required';
      if (!term.definition) newErrors[`definition-${index}`] = 'Definition is required';
    });
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const flashcard = {
      group,
      description,
      terms,
      image: newGroupImage,
    };

    dispatch(addFlashcard(flashcard));
    setErrors({});
    setSuccessMessage('Flashcard updated/created successfully!');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    setGroup('');
    setDescription('');
    setTerms([{ term: '', definition: '', image: null }]);
    setNewGroupImage(null);
  };

  
  

  const triggerFileUpload = (id) => {
    document.getElementById(id).click();
  };

  const handleGroupChange = (e) => {
    setGroup(e.target.value);
  };

  return (
    <div className="container mx-auto bg-gradient-to-r from-blue-50 to-blue-100 p-10 shadow-lg rounded-2xl mt-12 mb-12">
  {/* Group and Description Section */}
  <div className="mb-8 p-6 bg-white border-2 border-gray-300 rounded-2xl shadow-md hover:border-gray-700 transition duration-200">
    <div className="mb-6 flex flex-col sm:flex-row items-center">
      <div className="flex sm:w-1/3">
        <label className="flex text-gray-700 font-semibold">Group <span className="text-red-500">*</span></label>
        <div className="relative ml-2">
          <input
            type="text"
            value={group}
            onChange={handleGroupChange}
            list="group-options"
            placeholder="Select or enter new group"
            autoFocus
            className="mt-1 block w-full rounded-lg border-gray-600 shadow-sm p-2 focus:border-gray-800 focus:ring focus:ring-blue-200 hover:border-gray-800 transition duration-200"
          />
          <datalist id="group-options">
            {flashcards.map((flashcard, index) => (
              <option key={index} value={flashcard.group}>{flashcard.group}</option>
            ))}
          </datalist>
        </div>
        {errors.group && <p className="text-red-500 text-sm">{errors.group}</p>}
      </div>
      <div className="mt-4 sm:mt-0 sm:ml-6">
        <button
          type="button"
          onClick={() => triggerFileUpload('groupImage')}
          className="mt-1 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all flex items-center"
        >
          <FaUpload className="mr-2" /> Upload Image
        </button>
        <input
          type="file"
          id="groupImage"
          onChange={handleGroupImageChange}
          className="hidden"
          name="groupImage"
        />
        {newGroupImage && <img src={newGroupImage} alt="Group" className="mt-2 w-24 h-24 rounded-lg object-cover shadow-md" />}
      </div>
    </div>

    <div className="mb-6">
      <label className="block text-gray-700 font-semibold">Description <span className="text-red-500">*</span></label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus={!group}
        className="mt-1 block w-full rounded-lg border-gray-600 shadow-sm h-32 p-2 focus:border-gray-800 focus:ring focus:ring-blue-200 hover:border-gray-800 transition duration-200"
        disabled={isExistingGroup}
      />
      {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
    </div>
  </div>

  {/* Terms Section */}
  <div
    className={`mb-8 p-6 bg-white border-2 rounded-2xl shadow-md transition duration-200 ${
      group && description
        ? "border-gray-300 hover:border-gray-700"
        : "border-red-500"
    }`}
    title={group && description ? "" : "Please fill in the Group and Description sections first"}
  >
    <div className="text-xl font-semibold text-gray-700 mb-4">Terms</div>
    {terms.map((term, index) => (
      <div
        key={index}
        className={`mb-6 p-4 rounded-lg shadow-sm border-2 ${
          group && description ? "border-gray-600 hover:border-gray-800" : "border-red-500"
        } transition duration-200`}
      >
        <div className="flex flex-wrap items-center mb-2">
          <span className="mr-2 text-blue-500 text-lg">{index + 1}</span>
          <div className="w-full sm:w-1/3 mr-4 mb-4 sm:mb-0">
            <label className="block text-gray-700 font-semibold">Term <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="term"
              value={term.term}
              onChange={(e) => handleTermChange(index, e)}
              autoFocus={!group && index === 0}
              disabled={!group || !description}
              className={`mt-1 block w-full rounded-lg shadow-sm p-2 transition duration-200 ${
                group && description
                  ? "border-gray-600 hover:border-gray-800 focus:border-gray-800 focus:ring focus:ring-blue-200"
                  : "border-red-500 cursor-not-allowed"
              }`}
            />
            {errors[`term-${index}`] && <p className="text-red-500 text-sm">{errors[`term-${index}`]}</p>}
          </div>
          <div className="w-full sm:w-1/3 mr-4 mb-4 sm:mb-0">
            <label className="block text-gray-700 font-semibold">Definition <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="definition"
              value={term.definition}
              onChange={(e) => handleTermChange(index, e)}
              autoFocus={!group && index === 0}
              disabled={!group || !description}
              className={`mt-1 block w-full rounded-lg shadow-sm p-2 transition duration-200 ${
                group && description
                  ? "border-gray-600 hover:border-gray-800 focus:border-gray-800 focus:ring focus:ring-blue-200"
                  : "border-red-500 cursor-not-allowed"
              }`}
            />
            {errors[`definition-${index}`] && <p className="text-red-500 text-sm">{errors[`definition-${index}`]}</p>}
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              type="button"
              onClick={() => triggerFileUpload(`termImage-${index}`)}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg flex items-center transition-all"
              disabled={!group || !description}
            >
              <FaUpload className="mr-2" /> Select Image
            </button>
            <input
              type="file"
              id={`termImage-${index}`}
              onChange={(e) => handleTermImageChange(index, e)}
              className="hidden"
              name="termImage"
            />
            {term.image && <img src={term.image} alt={`Term ${index + 1}`} className="mt-2 w-20 h-20 object-cover rounded-lg shadow-md" />}
            <button
              type="button"
              onClick={() => deleteTerm(index)}
              className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg flex items-center transition-all"
              disabled={terms.length <= 1 || !group || !description}
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          </div>
        </div>
      </div>
    ))}
    <div className="mt-4 text-center">
      <button
        type="button"
        onClick={addMoreTerms}
        className="py-2 px-5 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg flex items-center transition-all"
        disabled={!group || !description}
      >
        <FaEdit className="mr-2" /> Add More Terms
      </button>
    </div>
  </div>

  <div className="text-right">
    <button
      type="button"
      onClick={handleSubmit}
      className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-all"
    >
      Save
    </button>
  </div>
  {successMessage && <p className="text-green-600 text-center mt-4 font-semibold">{successMessage}</p>}
</div>




  );
};

export default FlashcardForm;
