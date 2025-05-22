const characterList = document.getElementById('characterList'); 
const searchInput = document.getElementById('searchInput');
const favoritesList = document.getElementById('favoritesList');
const speciesFilter = document.getElementById('speciesFilter');
const sortOrder = document.getElementById('sortOrder');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || {}; // Notes perso

// === IntersectionObserver ===
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1
});

// === Display Characters ===
function displayCharacters(characters) {
    characterList.innerHTML = '';
  
    characters.forEach(character => {
      const card = document.createElement('div');
      card.className = 'card';
  
      const moreInfoId = `more-${character.id}`;
  
      card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" />
        <h3>${character.name}</h3>
        <p>Status: ${character.status}</p>
        <p>Species: ${character.species}</p>
        <p>Gender: ${character.gender}</p>
        <p>Episodes: ${character.episode.length}</p>
        <button class="fav-btn">
          ${favorites.includes(character.name) ? '✅ Favorite' : '❤️ Add to Favorites'}
        </button>
        <button class="more-btn">ℹ️ See more</button>
        <div class="more-info" id="${moreInfoId}" style="display: none;">
          <p>Origin: ${character.origin.name}</p>
          <p>Location: ${character.location.name}</p>
          <p>Created: ${new Date(character.created).toLocaleDateString()}</p>
          <form class="note-form">
            <input type="text" placeholder="Add a personal note..." value="${notes[character.name] || ''}" required />
            <button type="submit">💾 Save</button>
          </form>
        </div>
      `;

      // Observer attaché à chaque carte
      observer.observe(card);
  
      const favBtn = card.querySelector('.fav-btn');
      favBtn.addEventListener('click', () => {
        if (!favorites.includes(character.name)) {
          addToFavorites(character.name);
          favBtn.textContent = '✅ Favorite';
        }
      });

      const moreBtn = card.querySelector('.more-btn');
      const moreInfo = card.querySelector(`#${moreInfoId}`);
      
      moreBtn.addEventListener('click', () => {
        if (moreInfo.style.display === 'none') {
          moreInfo.style.display = 'block';
          moreBtn.textContent = '🔽 See less';
        } else {
          moreInfo.style.display = 'none';
          moreBtn.textContent = 'ℹ️ See more';
        }
      });

      const noteForm = card.querySelector('.note-form');
      noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = noteForm.querySelector('input');
        const value = input.value.trim();
        if (value !== '') {
          notes[character.name] = value;
          localStorage.setItem('notes', JSON.stringify(notes));
          alert('Note saved ✅');
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

// === Theme toggle logic ===
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  body.classList.add('dark-theme');
} else {
  body.classList.remove('dark-theme');
}

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
});
