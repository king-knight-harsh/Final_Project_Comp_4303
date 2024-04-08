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

// Game Characters
let dog, tom;
// Array to store all mice
let jerryAndFriends = [];

// Resource Setup
const resources = new Resources(resourceFiles);

// Setup our scene
async function setup() {
	// Set background color
	scene.background = new THREE.Color(0xffffff);

	// Light setup
	let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	// Set light position
	directionalLight.position.set(50, 100, 50);
	// Add light to the scene
	scene.add(directionalLight);

	// Initialize game map with 20 obstacles
	gameMap.init(scene, 20);
	// Create a new Tom instance
	tom = new Tom(new THREE.Color(0xff0000), gameMap);
	// Create a new Dog instance
	dog = new Dog(new THREE.Color(0xff0023), gameMap, tom);

	// Camera setup
	mapCamera.fov = 60;
	mapCamera.position.set(0, 40, 40);
	mapCamera.lookAt(0, 0, 0);
	mapCamera.updateProjectionMatrix();
	scene.add(mapCamera);

	// Model setup
	await setupModels();

	// Initialize characters
	initializeCharacters(gameMap, tom, dog, jerryAndFriends, scene);

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
		// Set models for dog and Tom
		dog.setModel(resources.get("spike"));
		dog.gameObject.scale.set(1, 1, 1);
		tom.setModel(resources.get("tom"));

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
			let jerryFriend = new Mouse(new THREE.Color(0x000000), gameMap, tom);
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
	// Update all characters
	jerryAndFriends.forEach((mouse) => {
		if (mouse) {
			mouse.update(deltaTime);
			// Each friend checks for Power-Up tile
		}
	});

	tom.update(deltaTime, controller);

	dog.update(deltaTime);

	if (tom != null && jerryAndFriends.length > 0) {
		// Check for capture
		checkForCaptureState.enterState(tom, jerryAndFriends, dog, scene);
	}

	orbitControls.update();

	renderer.render(scene, mapCamera);
}

// Start the game
setup();
