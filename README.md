# Rick & Morty SPA

Schoolproject **Advanced Web**.  
Single Page Application die de [Rick and Morty API](https://rickandmortyapi.com/) gebruikt om personages te tonen, filteren, sorteren en opslaan in favorieten.

---

## Functionaliteiten
- Zoeken op naam  
- Filteren op soort (Human / Alien)  
- Sorteren A–Z / Z–A  
- Favorieten opslaan in **LocalStorage**  
- Persoonlijke notities per personage (blijven bewaard)  
- Licht / Donker thema (voorkeur onthouden)  
- Kaartweergave (met detail en "see more")  
- Tabelweergave (8 kolommen: ID, Naam, Status, Soort, Geslacht, Oorsprong, Locatie, #Episodes)  
- Loader tijdens het ophalen van data  
- Scroll animatie (met **IntersectionObserver**)  
- **Responsive design** voor mobiel en desktop  

---

## Bestanden
- `index.html` → structuur van de pagina  
- `style.css` → design (grid, flexbox, thema’s, responsive, loader)  
- `script.js` → logica (API calls, filters, sorteren, favorieten, notities, opslag)  

---

## Technieken
- **DOM manipulatie**: dynamische kaarten maken, events koppelen, formulieren  
- **Modern JavaScript**: const/let, template literals, array methoden (filter/sort), arrow functions, ternary operator, promises, async/await  
- **Observer API**: IntersectionObserver voor animatie bij scrollen  
- **API + JSON**: data ophalen en tonen  
- **LocalStorage**: favorieten, thema, notities, filter/sort voorkeuren  
- **Form validatie**: notitieveld verplicht tekst  
- **Styling**: CSS Grid, Flexbox, thema switcher (licht/donker)  

---

## Screenshots
![Screenshot 1](screenshot/Screenshot%201.png)
![Screenshot 2](screenshot/Screenshot%202.png)
![Screenshot 3](screenshot/Screenshot%203.png)


---

## Bronnen
- [Rick and Morty API](https://rickandmortyapi.com/)  
- Achtergrondafbeeldingen uit de serie Rick & Morty  
- Hulp: ChatGPT + [MDN Web Docs](https://developer.mozilla.org/)
