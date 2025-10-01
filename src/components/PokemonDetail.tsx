import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      home?: {
        front_default: string | null;
      };
      official_artwork?: {
        front_default: string | null;
      };
    };
  };
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

interface PokemonListItem {
  name: string;
  url: string;
}

const PokemonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      if (!id) {
        setError('Pokémon ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setPokemon(null);

      try {
        // Fetch all Pokémon names for navigation
        if (allPokemon.length === 0) {
          const allPokemonResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1302');
          setAllPokemon(allPokemonResponse.data.results);
        }

        // Fetch specific Pokémon details
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        setPokemon(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetails();
  }, [id, allPokemon.length]);

  const handlePrevious = () => {
    if (pokemon && allPokemon.length > 0) {
      const currentIndex = allPokemon.findIndex(p => p.name === pokemon.name);
      const previousIndex = (currentIndex - 1 + allPokemon.length) % allPokemon.length;
      const previousPokemonName = allPokemon[previousIndex].name;
      navigate(`/pokemon/${previousPokemonName}`);
    }
  };

  const handleNext = () => {
    if (pokemon && allPokemon.length > 0) {
      const currentIndex = allPokemon.findIndex(p => p.name === pokemon.name);
      const nextIndex = (currentIndex + 1) % allPokemon.length;
      const nextPokemonName = allPokemon[nextIndex].name;
      navigate(`/pokemon/${nextPokemonName}`);
    }
  };

  const getStatBarClass = (statValue: number): string => {
    if (statValue <= 25) return 'stat-bar stat-width-10';
    if (statValue <= 50) return 'stat-bar stat-width-20';
    if (statValue <= 75) return 'stat-bar stat-width-30';
    if (statValue <= 100) return 'stat-bar stat-width-40';
    if (statValue <= 125) return 'stat-bar stat-width-50';
    if (statValue <= 150) return 'stat-bar stat-width-60';
    if (statValue <= 175) return 'stat-bar stat-width-70';
    if (statValue <= 200) return 'stat-bar stat-width-80';
    if (statValue <= 225) return 'stat-bar stat-width-90';
    return 'stat-bar stat-width-100';
  };

  const getFallbackSprite = (pokemon: Pokemon): string => {
    // Try multiple sprite sources first
    const spriteSources = [
      pokemon.sprites.front_default,
      pokemon.sprites.other?.home?.front_default,
      pokemon.sprites.other?.official_artwork?.front_default,
      pokemon.sprites.front_shiny
    ].filter(Boolean);

    if (spriteSources.length > 0) {
      return spriteSources[0] as string;
    }

    // For Koraidon variants, use base Koraidon sprite
    if (pokemon.name.includes('koraidon')) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1007.png';
    }
    // For Miraidon variants, use base Miraidon sprite
    if (pokemon.name.includes('miraidon')) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1008.png';
    }
    // For special Pikachu forms, use base Pikachu sprite
    if (pokemon.name.includes('pikachu') && pokemon.name !== 'pikachu') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
    }
    // For Toxtricity variants, use base Toxtricity sprite
    if (pokemon.name.includes('toxtricity') && pokemon.name !== 'toxtricity') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/849.png';
    }
    // For Morpeko variants, use base Morpeko sprite
    if (pokemon.name.includes('morpeko') && pokemon.name !== 'morpeko') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/877.png';
    }
    // For Voltorb/Electrode Hisui forms, use base forms
    if (pokemon.name.includes('voltorb-hisui')) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/100.png';
    }
    if (pokemon.name.includes('electrode-hisui')) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png';
    }
    // For Togedemaru variants, use base Togedemaru sprite
    if (pokemon.name.includes('togedemaru') && pokemon.name !== 'togedemaru') {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/777.png';
    }
    // For other Pokémon, try the standard sprite
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
  };


  if (loading) {
    return (
      <div className="detail-view">
        <div className="button-container">
          <Link to="/" className="nav-button">Search</Link>
          <Link to="/gallery" className="nav-button">Gallery</Link>
        </div>
        <div className="detail-container">
          <div className="loading">Loading Pokémon details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-view">
        <div className="button-container">
          <Link to="/" className="nav-button">Search</Link>
          <Link to="/gallery" className="nav-button">Gallery</Link>
        </div>
        <div className="detail-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="detail-view">
        <div className="button-container">
          <Link to="/" className="nav-button">Search</Link>
          <Link to="/gallery" className="nav-button">Gallery</Link>
        </div>
        <div className="detail-container">
          <div className="error-message">No Pokémon data available.</div>
        </div>
      </div>
    );
  }

  const currentPokemonIndex = allPokemon.findIndex(p => p.name === pokemon.name);
  const totalPokemon = allPokemon.length;

  return (
    <div className="detail-view">
      <div className="button-container">
        <Link to="/" className="nav-button">List View</Link>
        <Link to="/gallery" className="nav-button">Gallery View</Link>
      </div>
      
      <div className="detail-container">
        <div className="pokemon-detail-card">
          <div className="detail-header">
            <h2 className="pokemon-detail-name">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} <span className="pokemon-id">#{pokemon.id}</span>
            </h2>
          </div>

          <div className="detail-content">
            <div className="pokemon-image-section">
              <img 
                src={pokemon.sprites.front_default || pokemon.sprites.other?.home?.front_default || pokemon.sprites.other?.official_artwork?.front_default || getFallbackSprite(pokemon)}
                alt={pokemon.name}
                className="pokemon-detail-sprite"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getFallbackSprite(pokemon);
                }}
              />
            </div>
            <div className="pokemon-info-section">
              <div className="info-section">
                <h3>Basic Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Height:</span>
                    <span className="info-value">{pokemon.height / 10} m</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Weight:</span>
                    <span className="info-value">{pokemon.weight / 10} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Types:</span>
                    <div className="type-badges">
                      {pokemon.types.map(type => (
                        <span key={type.type.name} className="type-badge">
                          {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h3>Base Stats</h3>
                <div className="stats-grid">
                  {pokemon.stats.map(stat => (
                    <div key={stat.stat.name} className="stat-item">
                      <span className="stat-name">
                        {stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1).replace('-', ' ')}
                      </span>
                      <div className="stat-bar-container">
                        <div className={getStatBarClass(stat.base_stat)}></div>
                      </div>
                      <span className="stat-value">{stat.base_stat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="navigation-controls">
            <button onClick={handlePrevious} className="nav-arrow">←</button>
            <span className="pokemon-counter">
              {currentPokemonIndex !== -1 ? `${currentPokemonIndex + 1} of ${totalPokemon}` : ''}
            </span>
            <button onClick={handleNext} className="nav-arrow">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
