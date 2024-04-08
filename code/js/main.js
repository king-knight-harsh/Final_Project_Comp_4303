// Import necessary components
import * as THREE from "three";
import { GameMap } from "./Game/World/GameMap.js";
import { Mouse } from "./Game/Behaviour/Mouse.js";
import { Tom } from "./Game/Behaviour/Cat.js";
import { Controller } from "./Game/Behaviour/Controller.js"; // Ensure this is your updated Controller
import { Resources } from "./Util/Resources.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { resourceFiles } from "./Util/ResourceFile.js";
import { Dog } from "./Game/Behaviour/Dog.js";
import { initializeCharacters } from "./Util/InitializeCharacter.js";
import { CheckForCapture } from "./Game/Behaviour/State.js";

// Create Scene
const scene = new THREE.Scene();
// Create Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
// Set renderer size
renderer.setSize(window.innerWidth, window.innerHeight);
// Add renderer to the body
document.body.appendChild(renderer.domElement);
// Check for capture state
let checkForCaptureState = new CheckForCapture();

// Camera Setup
const mapCamera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
// Elevated position to view the whole map
mapCamera.position.set(0, 100, 0);
// Look at the center of the map
const orbitControls = new OrbitControls(mapCamera, renderer.domElement);
// Initial update
orbitControls.update();

// Game Components
const gameMap = new GameMap();
const clock = new THREE.Clock();

// Controller Variable
let controller;

// Array to store all dogs
let dogArray = [];
// Array to store all cats
let tomArray = [];
// Array to store all mice
let jerryAndFriends = [];
// Adding Directional Light
let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
// Resource Setup
const resources = new Resources(resourceFiles);

// Setup our scene
async function setup() {
	// Set background color
	scene.background = new THREE.Color(0xffffff);
	// Set light position
	directionalLight.position.set(
		mapCamera.position.x,
		mapCamera.position.y,
		mapCamera.position.z
	);
	// Add light to the scene
	scene.add(directionalLight);

	// Initialize game map with 20 obstacles
	gameMap.init(scene, 20);

	// Camera setup
	mapCamera.fov = 60;
	mapCamera.position.set(0, 40, 40);
	mapCamera.lookAt(0, 0, 0);
	mapCamera.updateProjectionMatrix();
	scene.add(mapCamera);

	// Model setup
	await setupModels();

	// Initialize characters
	initializeCharacters(
		gameMap,
		tomArray[0],
		dogArray[0],
		jerryAndFriends,
		scene
	);

	// Controller setup
	controller = new Controller(document, mapCamera);

	// Start animation loop
	animate();
}

/**
 * Load all models asynchronously and set them up in the scene.
 */
async function setupModels() {
	await resources.loadAll().then(() => {
		let tom = new Tom(new THREE.Color(0xff0023), gameMap);
		tom.setModel(resources.get("tom"));
		tomArray.push(tom);

		let dog = new Dog(new THREE.Color(0xff0023), gameMap, tomArray[0]);
		// Set models for dog and Tom
		dog.setModel(resources.get("spike"));
		dog.gameObject.scale.set(1, 1, 1);
		dogArray.push(dog);

		gameMap.getObstacles().forEach((obstacle) => {
			// Array of available building model names
			const buildingNames = [
				"building1",
				"building2",
				"building3",
				"building4",
				"building5",
			];

			// Randomly select a building model name
			const selectedBuildingName =
				buildingNames[Math.floor(Math.random() * buildingNames.length)];
			const selectedBuilding = resources.get(selectedBuildingName).clone();

			// Position the selected building model
			selectedBuilding.position.copy(obstacle.position);

			// Apply specific scales based on the selected building
			switch (selectedBuildingName) {
				case "building1":
					selectedBuilding.scale.set(2.6, 4, 4);
					break;
				case "building2":
					selectedBuilding.scale.set(6, 4, 6);
					break;
				case "building3":
					selectedBuilding.scale.set(2.8, 4, 6);
					break;
				case "building4":
					selectedBuilding.scale.set(4.2, 4, 4);
					break;
				case "building5":
					selectedBuilding.scale.set(4, 4, 4);
					break;
				default:
					// If for some reason the selected building is not found, log an error or set a default scale
					console.error(
						"Selected building not recognized:",
						selectedBuildingName
					);
					selectedBuilding.scale.set(1, 1, 1); // Default scale, adjust as needed
					break;
			}

			// Add the selected building model to the scene
			scene.add(selectedBuilding);
			// scene.remove(obstacle);
		});
		// Initialize additional mice
		for (let i = 0; i <= 3; i++) {
			let jerryFriend = new Mouse(
				new THREE.Color(0x000000),
				gameMap,
				tomArray[0]
			);
			if (i === 0) {
				jerryFriend.setModel(resources.get("jerry"));
				jerryFriend.gameObject.scale.set(0.5, 0.5, 0.5);
			} else {
				jerryFriend.setModel(resources.get(`jerryFriend${i}`));
				jerryFriend.gameObject.scale.set(1.5, 1.5, 1.5);
			}
			jerryAndFriends.push(jerryFriend);
		}
	});
}

/**
 * The main animation loop that updates the game state and renders the scene.
 */
function animate() {
	requestAnimationFrame(animate);
	// Calculate delta time
	let deltaTime = clock.getDelta();
	// Update Tom's direction
	if (controller) controller.setWorldDirection();

	directionalLight.position.set(
		mapCamera.position.x + 50,
		mapCamera.position.y + 100,
		mapCamera.position.z + 50
	);

	scene.add(directionalLight);

	if (jerryAndFriends.length > 0 && tomArray.length > 0) {
		// Update all mice
		jerryAndFriends.forEach((mouse) => {
			if (mouse) {
				mouse.update(deltaTime);
				// Each friend checks for Power-Up tile
			}
		});
	}
	if (tomArray.length > 0 && jerryAndFriends.length > 0)
		tomArray[0].update(deltaTime, controller);

	if (tomArray.length > 0 && jerryAndFriends.length > 0)
		dogArray[0].update(deltaTime);

	if (tomArray.length > 0 && jerryAndFriends.length > 0) {
		// Check for capture
		checkForCaptureState.enterState(tomArray, jerryAndFriends, dogArray, scene);
	}

	orbitControls.update();

	renderer.render(scene, mapCamera);
}
function onWindowResize() {
	mapCamera.aspect = window.innerWidth / window.innerHeight;
	mapCamera.updateProjectionMatrix();

	// Update the renderer size

	renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add a resize event listener

window.addEventListener("resize", onWindowResize);

// Start the game
setup();
