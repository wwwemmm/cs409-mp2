import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Pokemon {
  id: number;
  name: string;
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
}

interface PokemonType {
  name: string;
  pokemon: Pokemon[];
}

const GalleryView: React.FC = () => {
  const navigate = useNavigate();
  const [pokemonByType, setPokemonByType] = useState<PokemonType[]>([]);
  const [allTypes, setAllTypes] = useState<Array<{name: string, url: string}>>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('GalleryView rendered:', { allTypes: allTypes.length, selectedType, loading, error });

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedType(null);
        setPokemonByType([]);

        // Fetch all Pokémon types
        const typesResponse = await axios.get('https://pokeapi.co/api/v2/type');
        const typesData = typesResponse.data;
        
        // Filter out types with no Pokémon and non-standard types
        const validTypes = [];
        
        for (const type of typesData.results) {
          // Skip known empty/problematic types
          if (['shadow', 'unknown', 'stellar'].includes(type.name)) {
            continue;
          }
          
          // Check if this type has Pokémon
          const typeResponse = await axios.get(type.url);
          const typeData = typeResponse.data;
          
          if (typeData.pokemon && typeData.pokemon.length > 0) {
            validTypes.push(type);
          }
        }
        
        setAllTypes(validTypes);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchPokemonForType = async (typeName: string) => {
      try {
        setLoading(true);
        setError(null);

        const typeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${typeName}`);
        const typeData = typeResponse.data;
        
        // Get all Pokémon from this type
        const pokemonPromises = typeData.pokemon.map(async (pokemonEntry: any) => {
          const pokemonResponse = await axios.get(pokemonEntry.pokemon.url);
          return pokemonResponse.data;
        });
        
        const pokemon = await Promise.all(pokemonPromises);
        
        setPokemonByType([{
          name: typeName,
          pokemon: pokemon
        }]);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    if (selectedType) {
      fetchPokemonForType(selectedType);
    }
  }, [selectedType]);

  const handlePokemonClick = (pokemon: Pokemon) => {
    navigate(`/pokemon/${pokemon.name.toLowerCase()}`);
  };

  const handleTypeClick = (typeName: string) => {
    setSelectedType(typeName);
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

  if (loading && !selectedType) {
    return (
      <div className="gallery-view">
        <div className="button-container">
          <Link to="/" className="nav-button">
            Search
          </Link>
          <Link to="/gallery" className="nav-button active">
            Gallery
          </Link>
        </div>
        <div className="gallery-container">
          <div className="loading">Loading Pokémon types...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-view">
        <div className="button-container">
          <Link to="/" className="nav-button">
            Search
          </Link>
          <Link to="/gallery" className="nav-button active">
            Gallery
          </Link>
        </div>
        <div className="gallery-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-view">
      <div className="button-container">
        <Link to="/" className="nav-button">
          Search
        </Link>
        <Link to="/gallery" className="nav-button active">
          Gallery
        </Link>
      </div>
      
      <div className="gallery-container">
        <h2>Pokémon by Type</h2>
        
        {/* Type Selection Buttons */}
        <div className="type-selection">
          {allTypes.map((type) => (
            <button
              key={type.name}
              className={`type-button ${type.name} ${selectedType === type.name ? 'active' : ''}`}
              onClick={() => handleTypeClick(type.name)}
            >
              {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading state for selected type */}
        {loading && selectedType && (
          <div className="loading">Loading {selectedType} Pokémon...</div>
        )}

        {/* Message when no type is selected */}
        {!selectedType && !loading && allTypes.length > 0 && (
          <div className="type-selection-message">
            <p>Select a Pokémon type above to view Pokémon of that type.</p>
          </div>
        )}

        {/* Pokemon Display */}
        {pokemonByType.length > 0 && (
          <div className="pokemon-display">
            {pokemonByType.map((typeGroup) => (
              <div key={typeGroup.name} className="type-section">
                <h3 className={`type-header ${typeGroup.name}`}>
                  {typeGroup.name.charAt(0).toUpperCase() + typeGroup.name.slice(1)} Type Pokémon
                </h3>
                <div className="pokemon-type-grid">
                  {typeGroup.pokemon.map((pokemon) => (
                    <div 
                      key={pokemon.id} 
                      className="pokemon-gallery-item"
                      onClick={() => handlePokemonClick(pokemon)}
                    >
                      <div className={`pokemon-gallery-image ${typeGroup.name}`}>
                        <img 
                          src={pokemon.sprites.front_default || pokemon.sprites.other?.home?.front_default || pokemon.sprites.other?.official_artwork?.front_default || getFallbackSprite(pokemon)}
                          alt={pokemon.name}
                          className="pokemon-gallery-sprite"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getFallbackSprite(pokemon);
                          }}
                        />
                      </div>
                      <div className="pokemon-gallery-name">
                        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                      </div>
                      <div className="pokemon-gallery-id">#{pokemon.id}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No selection message */}
        {!selectedType && !loading && (
          <div className="no-selection">
            <p>Select a Pokémon type above to see Pokémon of that type!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;
