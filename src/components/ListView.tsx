import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const ListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'hp' | 'attack' | 'defense'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch all Pokémon names for partial matching
  useEffect(() => {
    const fetchPokemonNames = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1302&_t=' + Date.now());
        setAllPokemon(response.data.results);
      } catch (err) {
        console.error('Failed to fetch Pokémon names:', err);
      }
    };
    fetchPokemonNames();
  }, []);

  const sortPokemonList = useCallback((list: Pokemon[]) => {
    return [...list].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'hp':
          aValue = getStatValue(a, 'hp');
          bValue = getStatValue(b, 'hp');
          break;
        case 'attack':
          aValue = getStatValue(a, 'attack');
          bValue = getStatValue(b, 'attack');
          break;
        case 'defense':
          aValue = getStatValue(a, 'defense');
          bValue = getStatValue(b, 'defense');
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  // Re-sort existing results when sorting options change
  useEffect(() => {
    setPokemonList(prevList => {
      if (prevList.length === 0) {
        return prevList;
      }
      return sortPokemonList(prevList);
    });
  }, [sortPokemonList]);

  const getStatValue = (pokemon: Pokemon, statName: string): number => {
    const stat = pokemon.stats.find(s => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
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


  const searchPokemon = async (name: string) => {
    if (!name.trim()) {
      setPokemon(null);
      setPokemonList([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      // First try exact match
      try {
        const exactResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        setPokemon(exactResponse.data);
        setPokemonList([]);
        return;
      } catch (exactError) {
        // Exact match failed, continue to partial matching
      }

      // Try partial matching
      const filteredSuggestions = allPokemon.filter(p => 
        p.name.toLowerCase().includes(name.toLowerCase())
      );

      if (filteredSuggestions.length === 0) {
        setError('No Pokémon found matching your search');
        setPokemon(null);
        setPokemonList([]);
        return;
      }

      if (filteredSuggestions.length === 1) {
        // Single match - fetch its details
        const response = await axios.get(filteredSuggestions[0].url);
        setPokemon(response.data);
        setPokemonList([]);
      } else {
        // Multiple matches - fetch details for all
        const promises = filteredSuggestions.slice(0, 10).map(async (p) => {
          const response = await axios.get(p.url);
          return response.data;
        });
        
        const results = await Promise.all(promises);
        const sortedResults = sortPokemonList(results);
        setPokemonList(sortedResults);
        setPokemon(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPokemon(null);
      setPokemonList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: PokemonListItem) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    searchPokemon(suggestion.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = allPokemon.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchPokemon(searchTerm);
  };

  const navigate = useNavigate();
  const handlePokemonClick = (pokemon: Pokemon) => {
    navigate(`/pokemon/${pokemon.name.toLowerCase()}`);
  };

  const renderPokemonCard = (pokemon: Pokemon) => (
    <div key={pokemon.id} 
      className="pokemon-card"
      onClick={() => handlePokemonClick(pokemon)}>
      <div className="pokemon-image">
        <img 
          src={pokemon.sprites.front_default || pokemon.sprites.other?.home?.front_default || pokemon.sprites.other?.official_artwork?.front_default || getFallbackSprite(pokemon)}
          alt={pokemon.name}
          className="pokemon-sprite"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getFallbackSprite(pokemon);
          }}
        />
      </div>
      <div className="pokemon-details">
        <div className="pokemon-info">
          <div className="info-column name-column">
            <h3 className="pokemon-name">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} <span className="pokemon-id">#{pokemon.id}</span>
            </h3>
          </div>
          <div className="info-column">
            <p><strong>HP:</strong> {getStatValue(pokemon, 'hp')}</p>
            <p><strong>Attack:</strong> {getStatValue(pokemon, 'attack')}</p>
          </div>
          <div className="info-column">
            <p><strong>Defense:</strong> {getStatValue(pokemon, 'defense')}</p>
            <p>
              <strong>Types:</strong>
              <span className="pokemon-types">
                {pokemon.types.map(type => (
                  <span key={type.type.name} className="type-badge">
                    {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                  </span>
                ))}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="list-view">
      <div className="button-container">
        <Link to="/" className="nav-button active">
          Search
        </Link>
        <Link to="/gallery" className="nav-button">
          Gallery
        </Link>
      </div>
      
      <div className="list-container">
        <h2>Pokémon Search</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <div className="search-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Enter Pokémon name (e.g., pikachu, char, dragon)"
                className="search-input"
                autoComplete="off"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.name}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.name.charAt(0).toUpperCase() + suggestion.name.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {(pokemonList.length > 0 || pokemon) && (
          <div className="sorting-bar">
            <div className="sorting-controls">
              <label htmlFor="sort-by" className="sort-label">Sort by:</label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'hp' | 'attack' | 'defense')}
                    className="sort-select"
                  >
                    <option value="name">Name</option>
                    <option value="hp">HP</option>
                    <option value="attack">Attack</option>
                    <option value="defense">Defense</option>
                  </select>
              
              <label htmlFor="sort-order" className="sort-label">Order:</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="sort-select"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {pokemon && (
          <div className="pokemon-result">
            {renderPokemonCard(pokemon)}
          </div>
        )}

        {pokemonList.length > 0 && (
          <div className="pokemon-results">
            <h3>Search Results ({pokemonList.length} found)</h3>
            <div className="pokemon-grid">
              {pokemonList.map(renderPokemonCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
