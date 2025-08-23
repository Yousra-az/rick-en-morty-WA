// === Variabelen koppelen aan HTML-elementen (DOM selecties) ===
const characterList = document.getElementById('characterList'); 
const searchInput = document.getElementById('searchInput');
const favoritesList = document.getElementById('favoritesList');
const speciesFilter = document.getElementById('speciesFilter');
const sortOrder = document.getElementById('sortOrder');
const themeToggle = document.getElementById('themeToggle');
const tableBody = document.getElementById('tableBody');
const body = document.body;

// Data bewaren tussen sessies met LocalStorage

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || {}; // personal notes

// Current search (empty = no name filter)
let currentQuery = '';

// === Observer API: kaarten verschijnen pas in beeld bij scrollen ===
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1
});

// === Personages tonen in kaarten (met favorieten en notities) ===
function displayCharacters(characters) {
  if (!Array.isArray(characters) || characters.length === 0) {
    characterList.innerHTML = '<p class="no-results">No results.</p>';
    // Clear table too
    if (tableBody) tableBody.innerHTML = '';
    return;
  }

  characterList.innerHTML = '';
  
  characters.forEach(character => {
    const card = document.createElement('div');
    card.className = 'card';

    const moreInfoId = `more-${character.id}`;

    // Template literal → moderne manier om HTML te genereren in JavaScript
    card.innerHTML = `
      <img src="${character.image}" alt="${character.name}" loading="lazy" />
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

// Koppelen van kaart aan IntersectionObserver voor animatie
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

  // Also render the table view
  renderTable(characters);
}

// === Personages tonen in tabel (8 kolommen: ID, naam, status, soort, geslacht, origin, locatie, #episodes) ===
function renderTable(characters) {
  if (!tableBody) return;
  if (!Array.isArray(characters) || characters.length === 0) {
    tableBody.innerHTML = '';
    return;
  }

  const rows = characters.map(ch => `
    <tr>
      <td>${ch.id}</td>
      <td>${ch.name}</td>
      <td>${ch.status}</td>
      <td>${ch.species}</td>
      <td>${ch.gender}</td>
      <td>${ch.origin?.name ?? '—'}</td>
      <td>${ch.location?.name ?? '—'}</td>
      <td>${(ch.episode || []).length}</td>
    </tr>
  `).join('');

  tableBody.innerHTML = rows;
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
      fetchAndDisplayCharacters(); // refresh cards/table
    });

    li.appendChild(text);
    li.appendChild(removeBtn);
    favoritesList.appendChild(li);
  });
}

// === Search Input (UNIFIED with filters) ===
searchInput.addEventListener('input', () => {
  currentQuery = (searchInput.value || '').trim();
  fetchAndDisplayCharacters(); // single source of truth
});

// === Data ophalen uit de Rick & Morty API + filters en sortering toepassen ===
function fetchAndDisplayCharacters() {
  const selectedSpecies = speciesFilter.value; // "all" | "Human" | "Alien"
  const selectedSort = sortOrder.value;        // "az" | "za"

  // --- show loader in both views ---
  characterList.innerHTML = '<p class="loading"><span class="loader"></span>Loading…</p>';
  if (tableBody) {
    tableBody.innerHTML = '<tr><td colspan="8"><span class="loader"></span>Loading…</td></tr>';
  }

  // Build API URL with params
  const params = new URLSearchParams();
  if (currentQuery) params.set('name', currentQuery);     // server-side name filter
  if (selectedSpecies !== 'all') params.set('species', selectedSpecies);

  const url = `https://rickandmortyapi.com/api/character/?${params.toString()}`;

  fetch(url)
    .then(res => {
      // API returns 404 for no matches -> convert to empty results
      if (!res.ok) {
        if (res.status === 404) return { results: [] };
        throw new Error('Network/API error');
      }
      return res.json();
    })
    .then(data => {
      let characters = data.results || [];

      // Local sort (A→Z / Z→A)
      characters.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (selectedSort === 'az') return nameA.localeCompare(nameB);
        if (selectedSort === 'za') return nameB.localeCompare(nameA);
        return 0;
      });

      displayCharacters(characters);

      // Save preferences
      localStorage.setItem('selectedSpecies', selectedSpecies);
      localStorage.setItem('selectedSort', selectedSort);
    })
    .catch(() => {
      // On unexpected network error: keep UI stable
      displayCharacters([]);
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

// === (Optional) Lazy loading util if you switch to data-src later ===
function setupLazyImages() {
  const imgs = document.querySelectorAll('img.lazy-img[data-src]');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;           
      img.removeAttribute('data-src');     
      img.classList.remove('lazy-img');
      obs.unobserve(img);                  
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => io.observe(img));
}
