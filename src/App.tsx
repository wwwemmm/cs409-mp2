import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ListView from './components/ListView';
import GalleryView from './components/GalleryView';
import PokemonDetail from './components/PokemonDetail';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ListView />} />
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
      </Routes>
    </div>
  );
}

export default App;
