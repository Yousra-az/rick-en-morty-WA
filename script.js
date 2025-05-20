const characterList = document.getElementById('characterList');
const searchInput = document.getElementById('searchInput');
const favoritesList = document.getElementById('favoritesList');
const speciesFilter = document.getElementById('speciesFilter');
const sortOrder = document.getElementById('sortOrder');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Fetch characters
async function fetchCharacters() {
  try {
    const response = await fetch('https://rickandmortyapi.com/api/character');
    const data = await response.json();
    displayCharacters(data.results);
  } catch (error) {
    console.error('Error fetching characters:', error);
  }
}

// Affiche les personnages
function displayCharacters(characters) {
  characterList.innerHTML = '';

  characters.forEach(character => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${character.image}" alt="${character.name}" />
      <h3>${character.name}</h3>
      <p>Status: ${character.status}</p>
      <p>Species: ${character.species}</p>
      <button class="fav-btn">❤️ Add to Favorites</button>
    `;

    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', () => {
      addToFavorites(character.name);
    });

    characterList.appendChild(card);
  });
}

// Ajoute un personnage aux favoris
function addToFavorites(name) {
  if (!favorites.includes(name)) {
    favorites.push(name);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesUI();
  }
}

// Met à jour la liste des favoris affichée
function updateFavoritesUI() {
  favoritesList.innerHTML = '';

  favorites.forEach(name => {
    const li = document.createElement('li');
    const text = document.createElement('span');
    text.textContent = name;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '❌';
    removeBtn.style.marginLeft = '10px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.background = 'none';
    removeBtn.style.border = 'none';
    removeBtn.style.color = 'red';
    removeBtn.style.fontSize = '16px';

    removeBtn.addEventListener('click', () => {
      favorites = favorites.filter(fav => fav !== name);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      updateFavoritesUI();
    });

    li.appendChild(text);
    li.appendChild(removeBtn);
    favoritesList.appendChild(li);
  });
}

// Recherche
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  fetch('https://rickandmortyapi.com/api/character')
    .then(res => res.json())
    .then(data => {
      const filtered = data.results.filter(character =>
        character.name.toLowerCase().includes(query)
      );
      displayCharacters(filtered);
    });
});

// Filtrage et tri combiné
function fetchAndDisplayCharacters() {
  const selectedSpecies = speciesFilter.value;
  const selectedSort = sortOrder.value;

  fetch('https://rickandmortyapi.com/api/character')
    .then(res => res.json())
    .then(data => {
      let characters = data.results;

      if (selectedSpecies !== 'all') {
        characters = characters.filter(char => char.species === selectedSpecies);
      }

      characters.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (selectedSort === 'az') return nameA.localeCompare(nameB);
        if (selectedSort === 'za') return nameB.localeCompare(nameA);
      });

      displayCharacters(characters);
    });
}

// Listeners
speciesFilter.addEventListener('change', fetchAndDisplayCharacters);
sortOrder.addEventListener('change', fetchAndDisplayCharacters);

// Initialise
fetchCharacters();
updateFavoritesUI();

  