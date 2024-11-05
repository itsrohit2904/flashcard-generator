import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import FlashcardForm from './Components/FlashcardForm';
import MyFlashcards from './Components/MyFlashcards';
import ViewCard from './Components/ViewCard';
import AllFlashcards from './Components/AllFlashcards';
import logo from '../src/Assests/logo.jpeg'

function App() {
  return (
    <Router>
      <div className="App">
      <header className="bg-[white] p-4 shadow-md flex items-center justify-between">
  {/* Logo and Title */}
  <div className="flex items-center space-x-3">
    <img src={logo} alt="Flashcard Generator Logo" className="w-20 h-20 rounded-full" />
    <h1 className="text-3xl font-bold text-black-300">Card Crafter</h1>
  </div>
</header>

        <nav className="flex justify-center mt-4 space-x-4 p-4">
  <Link
    to="/"
    className="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg transition duration-200 ease-in-out"
  >
    Create New
  </Link>
  <Link
    to="/my-flashcards"
    className="bg-red-500 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg transition duration-200 ease-in-out"
  >
    My Flashcards
  </Link>
</nav>
        <main className="p-4">
          <Routes>
            <Route exact path="/" element={<FlashcardForm />} />
            <Route path="/my-flashcards" element={<MyFlashcards />} />
            <Route path="/view-card/:index" element={<ViewCard />} />
            <Route path="/all-flashcards" component={<AllFlashcards />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
