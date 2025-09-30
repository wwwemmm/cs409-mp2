import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    front_default: string;
  };
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

  // Fetch all Pokémon names for partial matching
  useEffect(() => {
    const fetchPokemonNames = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        setAllPokemon(data.results);
      } catch (err) {
        console.error('Failed to fetch Pokémon names:', err);
      }
    };
    fetchPokemonNames();
  }, []);

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
      const exactResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      
      if (exactResponse.ok) {
        const exactData = await exactResponse.json();
        setPokemon(exactData);
        setPokemonList([]);
        return;
      }

      // If exact match fails, try partial matching
      const filteredSuggestions = allPokemon.filter(p => 
        p.name.toLowerCase().includes(name.toLowerCase())
      );

      if (filteredSuggestions.length === 0) {
        throw new Error('No Pokémon found matching your search');
      }

      if (filteredSuggestions.length === 1) {
        // Single match - fetch its details
        const response = await fetch(filteredSuggestions[0].url);
        const data = await response.json();
        setPokemon(data);
        setPokemonList([]);
      } else {
        // Multiple matches - fetch details for all
        const promises = filteredSuggestions.slice(0, 10).map(async (p) => {
          const response = await fetch(p.url);
          return response.json();
        });
        
        const results = await Promise.all(promises);
        setPokemonList(results);
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

  const renderPokemonCard = (pokemon: Pokemon) => (
    <div key={pokemon.id} className="pokemon-card">
      <div className="pokemon-image">
        <img 
          src={pokemon.sprites.front_default} 
          alt={pokemon.name}
          className="pokemon-sprite"
        />
      </div>
      <div className="pokemon-details">
        <h3 className="pokemon-name">
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </h3>
        <div className="pokemon-info">
          <p><strong>ID:</strong> #{pokemon.id}</p>
          <p><strong>Height:</strong> {pokemon.height / 10}m</p>
          <p><strong>Weight:</strong> {pokemon.weight / 10}kg</p>
          <p><strong>Types:</strong> {pokemon.types.map(type => 
            type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)
          ).join(', ')}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="list-view">
      <div className="button-container">
        <Link to="/" className="nav-button active">
          List View
        </Link>
        <Link to="/gallery" className="nav-button">
          Gallery View
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
                placeholder="Enter Pokémon name (e.g., pikachu, char, water)"
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

        {!pokemon && pokemonList.length === 0 && !loading && !error && (
          <div className="search-hint">
            <p>Search for any Pokémon by name to see their details!</p>
            <p>Try partial searches like: <strong>char</strong> (for Charizard), <strong>water</strong> (for Water-type Pokémon), or <strong>pika</strong> (for Pikachu)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
