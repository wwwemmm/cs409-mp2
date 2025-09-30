import React from 'react';
import { Link } from 'react-router-dom';

const GalleryView: React.FC = () => {
  // Sample data for demonstration
  const images = [
    { id: 1, title: 'Image 1', url: 'https://picsum.photos/300/200?random=1' },
    { id: 2, title: 'Image 2', url: 'https://picsum.photos/300/200?random=2' },
    { id: 3, title: 'Image 3', url: 'https://picsum.photos/300/200?random=3' },
    { id: 4, title: 'Image 4', url: 'https://picsum.photos/300/200?random=4' },
    { id: 5, title: 'Image 5', url: 'https://picsum.photos/300/200?random=5' },
    { id: 6, title: 'Image 6', url: 'https://picsum.photos/300/200?random=6' },
  ];

  return (
    <div className="gallery-view">
      <div className="button-container">
        <Link to="/" className="nav-button">
          List View
        </Link>
        <Link to="/gallery" className="nav-button active">
          Gallery View
        </Link>
      </div>
      
      <div className="gallery-container">
        <h2>Image Gallery</h2>
        <div className="gallery-grid">
          {images.map((image) => (
            <div key={image.id} className="gallery-item">
              <img 
                src={image.url} 
                alt={image.title}
                className="gallery-image"
              />
              <div className="image-title">{image.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryView;
