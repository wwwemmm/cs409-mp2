import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ListView from './components/ListView';
import GalleryView from './components/GalleryView';
import PokemonDetail from './components/PokemonDetail';
import './App.css';

function App() {
  const location = useLocation();
  
  return (
    <div className="App">
      <div className="website-header">
        <h1 className="website-title">Pokédex Explorer</h1>
      </div>
      <Routes>
        <Route path="/" element={<ListView key={location.pathname} />} />
        <Route path="/gallery" element={<GalleryView key={location.pathname} />} />
        <Route path="/pokemon/:id" element={<PokemonDetail key={location.pathname} />} />
      </Routes>
    </div>
  );
}

export default App;
