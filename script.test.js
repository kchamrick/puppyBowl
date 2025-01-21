//For each TO DO, follow this pattern: 1. Set up test data, 2. Run tests, 3. Make assertions about results, and 4. Test success and error scenarios for each.
//From the assignment instruction: In script.test.js, use 'describe' to add test specs for fetchSinglePlayer and addNewPlayer. Each 'describe' should contain at least one test. Optional: write tests for removePlayer. 

const { //variables for which we define functions for this workshop
  fetchAllPlayers,
  fetchSinglePlayer,
  addNewPlayer,
  removePlayer,
  renderAllPlayers,
  renderSinglePlayer,
  renderNewPlayerForm,
} = require("./script"); //imports data from our script.js file

// Make the API call once before all the tests run

//1. FETCH ALL PLAYERS
describe("fetchAllPlayers", () => {
  let players; //declares a variable to store the API response
  beforeAll(async () => { //beforeAll runs first 
    players = await fetchAllPlayers();
  }); //asynchronous function handles the asynchronous API call
  test("returns an array", async () => {
    expect(Array.isArray(players)).toBe(true); //checks to see if players is an array 
  });

  test("returns players with name and id", async () => {
    players.forEach((player) => {
      expect(player).toHaveProperty("name");
      expect(player).toHaveProperty("id");
    }); //checks each player object against the named properties
  });
});

//2. FETCH SINGLE PLAYER
describe("fetchSinglePlayer", () => {
  let player; //function for fetching a single player
  const testPlayerId = 1; // defines an ID to test with
  beforeAll(async () => { //fetches the player before tests
    player = await fetchSinglePlayer(testPlayerId); //calls API
  });

  test("returns a single player object", async () => {
    expect(typeof player).toBe("object");
    expect(Array.isArray(player)).toBe(false);
  }); //checks to see if return value is an object and checks data type

  test("returns player with correct properties", async () => {
    expect(player).toHaveProperty("name");
    expect(player).toHaveProperty("id");
    expect(player).toHaveProperty("breed");
    expect(player).toHaveProperty("status");
  }); //checks player against named properties

  test("returns the correct player based on ID", async () => {
    expect(player.id).toBe(testPlayerId);
  });
}); //returns the correct player based on ID

//3. ADD NEW PLAYER`
describe("addNewPlayer", () => {
  const newPlayerData = {
    name: "TestPuppy",
    breed: "Mixed",
    status: "bench"
  }; //creates test data for new player
  
  let addedPlayer; //adds the player before running tests

  beforeAll(async () => {
    addedPlayer = await addNewPlayer(newPlayerData);
  });

  test("successfully adds a new player", async () => {
    expect(addedPlayer).toBeDefined();
    expect(typeof addedPlayer).toBe("object");
  }); //verifies that the player was added successfully 

  test("new player has correct properties", async () => {
    expect(addedPlayer).toHaveProperty("name", newPlayerData.name);
    expect(addedPlayer).toHaveProperty("breed", newPlayerData.breed);
    expect(addedPlayer).toHaveProperty("status", newPlayerData.status);
    expect(addedPlayer).toHaveProperty("id");
  }); //checks the player's properties

  test("new player has generated ID", async () => {
    expect(typeof addedPlayer.id).toBe("number");
  }); //checks to see that an ID has been associated with the newly added player

  test("added player can be retrieved", async () => {
    const retrievedPlayer = await fetchSinglePlayer(addedPlayer.id);
    expect(retrievedPlayer).toMatchObject(newPlayerData);
  });
}); //verifies that the added player can be retrieved

//4. REMOVE PLAYER 
describe("removePlayer", () => {
  let playerToRemove; //creates a test player for removal testing
  
  // Creates a test player to remove
  beforeAll(async () => {
    const testPlayer = {
      name: "RemoveTestPuppy",
      breed: "Test Breed",
      status: "bench"
    };
    playerToRemove = await addNewPlayer(testPlayer);
  });

  test("successfully removes a player", async () => {
    const result = await removePlayer(playerToRemove.id);
    expect(result).toBe(true);
  }); //tests successful removal of player

  test("removed player cannot be retrieved", async () => {
    await expect(fetchSinglePlayer(playerToRemove.id))
      .rejects
      .toThrow();
  }); //verifies that the 'removed' player is actually removed

  test("throws error when removing non-existent player", async () => {
    await expect(removePlayer(99999))
      .rejects
      .toThrow();
  });
}); //throws an error when trying to fetch a removed player