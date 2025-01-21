// Use the API_URL variable to make fetch requests to the API.
// Replace the placeholder with your cohort name (ex: 2109-UNF-HY-WEB-PT)
const cohortName = "2412-FTB-ET-WEB-FT";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */

const fetchAllPlayers = async () => {
  try { //creates an async function that fetches all players
    const response = await fetch (`${API_URL}/players`); //waits for the response
    const result = await response.json(); //converts to JSON
    return result.data.players; //returns the players from the data object
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
    return []; //if there's an error fetching the data, it returns an empty array
  }
};

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try { //fetches the playerId parameter
    const response = await fetch(`${API_URL}/players/${playerId}`); //makes a GET request to players/playerId
    const result = await response.json();
    return result.data.player; //returns a single player object
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    return null; //returns null if there's an error pulling the player
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...playerObj,
        status: 'bench'
      })
    });  
    const result = await response.json();
    return result.data.newPlayer;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
    return null;
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try { //takes playerId as the parameter
    const response = await fetch(`${API_URL}/players/${playerId}`, {
      method: 'DELETE', //makes a playerId delete request
    });
    const result = await response.json(); //waits for the data 
    return result; //returns the response 
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err //throws an error if unsuccessful in the delete request
    );
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => { //takes an array of players
  const main = document.querySelector('main');
  main.innerHTML = ''; //uses the querySelector to fetch the main element from the HTML using DOM

  if (!playerList || playerList.length === 0) {
    main.innerHTML = '<h2>No players available</h2>'; //clears its contents and shows a message 'no players available' if no players exist
    return;
  }
//creates an HTML card for each player using the map method -- each card contains the player's image, name, ID, and two buttons. The buttons have inline asynch functions for viewing details and removing players.
const playerCards = playerList.map(player => `
  <div class="player-card">
    <div class="image-container">
      <img src="${player.imageUrl}" alt="${player.name}">
    </div>
    <h3>${player.name}</h3>
    <p>ID: ${player.id}</p>
    <p>Status: ${player.status}</p>
    <div class="button-container">
      <button onclick="(async () => {
        const player = await fetchSinglePlayer(${player.id});
        renderSinglePlayer(player);
      })()">See details</button>
      <button onclick="(async () => {
        await removePlayer(${player.id});
        const players = await fetchAllPlayers();
        renderAllPlayers(players);
      })()">Remove from roster</button>
    </div>
  </div>
  `).join('');

  main.innerHTML = `
    <div class="player-container">
      ${playerCards}
    </div>
  `;
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = (player) => {
  const main = document.querySelector('main');
  //takes a single player object and uses the querySelector to select main from the HTML using DOM
  if (!player) {
    main.innerHTML = '<h2>Player not found</h2>'; //if no player is found, an error message is shown
    return;
  }

  //creates a detailed card for the player and a back button to return to all players
  main.innerHTML = `
    <div class="single-player-card">
      <img src="${player.imageUrl}" alt="${player.name}">
      <h3>${player.name}</h3>
      <p>ID: ${player.id}</p>
      <p>Breed: ${player.breed}</p>
      <p>Team: ${player.team ? player.team.name : 'Unassigned'}</p>
      <button onclick="(async () => {
        const players = await fetchAllPlayers();
        renderAllPlayers(players);
      })()">Back to all players</button>
    </div>
  `;
};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  try { //creates a form with inputs for name, breed, and image 
    const form = document.getElementById('new-player-form');
    form.innerHTML = `
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>
      
      <label for="breed">Breed:</label>
      <input type="text" id="breed" name="breed" required>

      <label for="status">Status:</label>
      <select id="status" name="status" required>
        <option value="bench">Bench</option>
        <option value="field">Field</option>
      </select>

      <label for="teamId">Team:</label>
      <select id="teamId" name="teamId" required>
       <option value="1">Ruff</option>
        <option value="2">Fluff</option>
      </select>
      
      <label for="imageUrl">Image URL:</label>
      <input type="url" id="imageUrl" name="imageUrl" required>
      
      <button type="submit">Add Player</button>
    `;
//adds a submit event listener and prevents default form submission
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      //collects form data and creates new player
      const playerData = {
        name: form.name.value,
        breed: form.breed.value,
        status: form.status.value,
        imageUrl: form.imageUrl.value,
      };
//refreshes the player list and resets the form
      await addNewPlayer(playerData);
      const players = await fetchAllPlayers();
      renderAllPlayers(players);
      form.reset();
    });
  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  } //if there's an error in adding the new player, an error is thrown
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => { //fetches and renders all players and the form
  const players = await fetchAllPlayers();
  renderAllPlayers(players); //waits for the data

  renderNewPlayerForm(); //initializes the application
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
  module.exports = {
    fetchAllPlayers,
    fetchSinglePlayer,
    addNewPlayer,
    removePlayer,
    renderAllPlayers,
    renderSinglePlayer,
    renderNewPlayerForm,
  };
} else {
  init();
}
