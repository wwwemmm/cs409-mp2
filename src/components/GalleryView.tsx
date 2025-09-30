import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Pokemon {
  id: number;
  name: string;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string;
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

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all Pokémon types
        const typesResponse = await fetch('https://pokeapi.co/api/v2/type');
        const typesData = await typesResponse.json();
        
        // Filter out shadow, unknown, and other non-standard types
        const mainTypes = typesData.results.filter((type: any) => 
          !['shadow', 'unknown'].includes(type.name)
        );
        
        setAllTypes(mainTypes);
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

        const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        const typeData = await typeResponse.json();
        
        // Get first 12 Pokémon from this type
        const pokemonPromises = typeData.pokemon.slice(0, 12).map(async (pokemonEntry: any) => {
          const pokemonResponse = await fetch(pokemonEntry.pokemon.url);
          return pokemonResponse.json();
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
    navigate(`/pokemon/${pokemon.id}`);
  };

  const handleTypeClick = (typeName: string) => {
    setSelectedType(typeName);
  };


  const getTypeColor = (typeName: string): string => {
    const colors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return colors[typeName] || '#68A090';
  };

  if (loading && !selectedType) {
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
            List View
          </Link>
          <Link to="/gallery" className="nav-button active">
            Gallery View
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
          List View
        </Link>
        <Link to="/gallery" className="nav-button active">
          Gallery View
        </Link>
      </div>
      
      <div className="gallery-container">
        <h2>Pokémon by Type</h2>
        
        {/* Type Selection Buttons */}
        <div className="type-selection">
          {allTypes.map((type) => (
            <button
              key={type.name}
              className={`type-button ${selectedType === type.name ? 'active' : ''}`}
              onClick={() => handleTypeClick(type.name)}
              style={{
                backgroundColor: selectedType === type.name ? getTypeColor(type.name) : `${getTypeColor(type.name)}40`,
                borderColor: getTypeColor(type.name),
                color: selectedType === type.name ? 'white' : getTypeColor(type.name)
              }}
            >
              {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading state for selected type */}
        {loading && selectedType && (
          <div className="loading">Loading {selectedType} Pokémon...</div>
        )}

        {/* Pokemon Display */}
        {pokemonByType.length > 0 && (
          <div className="pokemon-display">
            {pokemonByType.map((typeGroup) => (
              <div key={typeGroup.name} className="type-section">
                <h3 
                  className="type-header"
                  style={{ 
                    background: `linear-gradient(135deg, ${getTypeColor(typeGroup.name)}, ${getTypeColor(typeGroup.name)}88)`,
                    color: 'white'
                  }}
                >
                  {typeGroup.name.charAt(0).toUpperCase() + typeGroup.name.slice(1)} Type Pokémon
                </h3>
                <div className="pokemon-type-grid">
                  {typeGroup.pokemon.map((pokemon) => (
                    <div 
                      key={pokemon.id} 
                      className="pokemon-gallery-item"
                      onClick={() => handlePokemonClick(pokemon)}
                    >
                      <div 
                        className="pokemon-gallery-image"
                        style={{ backgroundColor: `${getTypeColor(typeGroup.name)}20` }}
                      >
                        <img 
                          src={pokemon.sprites.front_default} 
                          alt={pokemon.name}
                          className="pokemon-gallery-sprite"
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
