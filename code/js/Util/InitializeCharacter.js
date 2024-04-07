export function initializeCharacters(
	gameMap,
	jerry,
	tom,
	dog,
	jerryFriends,
	scene,
	mapCamera,
	activeCamera
) {
	// Get a random starting place for Jerry and Tom
	let startNPC = gameMap.graph.getRandomEmptyTile();
	let startPlayer = gameMap.graph.getRandomEmptyTile();
	let dogPlayer = gameMap.graph.getRandomEmptyTile();
	// Set initial locations
	jerry.location = gameMap.localize(startNPC);
	tom.location = gameMap.localize(startPlayer);
	dog.location = gameMap.localize(dogPlayer);

	scene.add(jerry.gameObject);
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
