const characterList = document.getElementById('characterList');
const searchInput = document.getElementById('searchInput');
const favoritesList = document.getElementById('favoritesList');
const speciesFilter = document.getElementById('speciesFilter');
const sortOrder = document.getElementById('sortOrder');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// === Display Characters ===
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
      <button class="fav-btn">
        ${favorites.includes(character.name) ? '✅ Favorite' : '❤️ Add to Favorites'}
      </button>
    `;

    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', () => {
      if (!favorites.includes(character.name)) {
        addToFavorites(character.name);
        favBtn.textContent = '✅ Favorite';
      }
    });

    characterList.appendChild(card);
  });
}

// === Add to Favorites ===
function addToFavorites(name) {
  if (!favorites.includes(name)) {
    favorites.push(name);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesUI();
  }
}

// === Update Favorites UI ===
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
      fetchAndDisplayCharacters(); // Refresh cards
    });

    li.appendChild(text);
    li.appendChild(removeBtn);
    favoritesList.appendChild(li);
  });
}

// === Search Input ===
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

// === Filter & Sort ===
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

      // Save preferences
      localStorage.setItem('selectedSpecies', selectedSpecies);
      localStorage.setItem('selectedSort', selectedSort);
    });
}

// === Event Listeners ===
speciesFilter.addEventListener('change', fetchAndDisplayCharacters);
sortOrder.addEventListener('change', fetchAndDisplayCharacters);

// === Init ===
const savedSpecies = localStorage.getItem('selectedSpecies');
const savedSort = localStorage.getItem('selectedSort');

if (savedSpecies) speciesFilter.value = savedSpecies;
if (savedSort) sortOrder.value = savedSort;

fetchAndDisplayCharacters();
updateFavoritesUI();
