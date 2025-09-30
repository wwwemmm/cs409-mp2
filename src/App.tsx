import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ListView from './components/ListView';
import GalleryView from './components/GalleryView';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ListView />} />
        <Route path="/gallery" element={<GalleryView />} />
      </Routes>
    </div>
  );
}

export default App;
