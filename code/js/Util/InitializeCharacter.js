/**
 * Initializes characters within a game, placing them at random locations on the game map and adding them to the scene.
 * This function randomly positions key game characters—Tom, a dog, and Jerry's friends—on the game map. Each character is
 * given a starting location that does not overlap with others, ensuring they are placed on empty tiles within the game world.
 * After positioning, the characters' game objects are added to the scene for rendering. The function also sets the initial
 * active camera to provide an overview of the map, focusing on the game space where the characters are situated.
 *
 * @param {Object} gameMap - An object representing the game map, which should provide a mechanism to get random empty tiles
 *                           (via `gameMap.graph.getRandomEmptyTile()`) and to convert tile positions to world space coordinates
 *                           (via `gameMap.localize(tile)`).
 * @param {Object} tom - The character object for Tom, which must have a `location` property for positioning and a `gameObject`
 *                       property to add to the scene.
 * @param {Object} dog - The character object for the dog, similar in structure to the `tom` object.
 * @param {Array} jerryFriends - An array of character objects for Jerry's friends, each with `location` and `gameObject` properties
 *                               like `tom` and `dog`.
 * @param {THREE.Scene} scene - The THREE.js scene to which the character objects will be added.
 * @param {THREE.Camera} mapCamera - The camera that provides an overview of the entire game map. This is set as the active camera
 *                                   at the end of character initialization.
 * @param {THREE.Camera} activeCamera - A reference to the currently active camera. This function sets it to `mapCamera`.
 *
 */
export function initializeCharacters(
	gameMap,
	tom,
	dog,
	jerryFriends,
	scene,
	mapCamera,
	activeCamera
) {
	// Get a random starting place for Jerry and Tom
	let catPlayer = gameMap.graph.getRandomEmptyTile();
	let dogPlayer = gameMap.graph.getRandomEmptyTile();

	tom.location = gameMap.localize(catPlayer);
	dog.location = gameMap.localize(dogPlayer);

	scene.add(tom.gameObject);
	scene.add(dog.gameObject);

	jerryFriends.forEach((mouse, index) => {
		let startMouse = gameMap.graph.getRandomEmptyTile();
		mouse.location = gameMap.localize(startMouse);
		scene.add(mouse.gameObject);
	});

	// Active camera starts with the map view
	activeCamera = mapCamera;
}
