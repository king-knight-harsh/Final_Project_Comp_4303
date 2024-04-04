// Import necessary components
import * as THREE from "three";
import { GameMap } from "./Game/World/GameMap.js";
import { Mouse } from "./Game/Behaviour/Jerry.js";
import { Tom } from "./Game/Behaviour/Tom.js";
import { Controller } from "./Game/Behaviour/Controller.js"; // Ensure this is your updated Controller
import { Resources } from "./Util/Resources.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Create Scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera Setup
const mapCamera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
mapCamera.position.set(0, 100, 0); // Elevated position to view the whole map
const orbitControls = new OrbitControls(mapCamera, renderer.domElement);
orbitControls.update(); // Initial update

// Game Components
const gameMap = new GameMap();
const clock = new THREE.Clock();
let tomCamera, jerryCamera;
let activeCamera = mapCamera;
let controller;

// Characters
const tom = new Tom(new THREE.Color(0xff0000));
const jerry = new Mouse(new THREE.Color(0x000000));
const jerryFriends = []; // Assuming initialization of Jerry's friends happens later

// Resource loading
let files = [
	{ name: "tom", url: "/Models/tom.glb" },
	{ name: "jerry", url: "/Models/jerry.glb" },
	{ name: "jerryFriend1", url: "/Models/jerryFriendOne.glb" },
	{ name: "jerryFriend2", url: "/Models/jerryFriendTwo.glb" },
	{ name: "jerryFriend3", url: "/Models/jerryFriendThree.glb" },
];
const resources = new Resources(files);

// Update camera reference in the controller based on interactions or game events
document.addEventListener("keydown", (event) => {
	if (event.key === "c" || event.key === "C") {
		activeCamera =
			activeCamera === tomCamera
				? jerryCamera
				: activeCamera === jerryCamera
				? mapCamera
				: tomCamera;

		controller.setCamera(activeCamera);
	}
});

// Setup our scene
async function setup() {
	scene.background = new THREE.Color(0xffffff);

	// Light setup
	let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.set(50, 100, 50);
	scene.add(directionalLight);

	gameMap.init(scene);
	scene.add(gameMap.gameObject);

	// Camera setup
	setupCameras();

	controller = new Controller(document, activeCamera);

	// Model setup
	await setupModels();

	// Initial positions
	initializeCharacters();

	// Start animation loop
	animate();
}

async function setupModels() {
	await resources.loadAll().then(() => {
		jerry.setModel(resources.get("jerry"));
		// Scale Jerry down
		jerry.gameObject.scale.set(0.5, 0.5, 0.5);

		tom.setModel(resources.get("tom"));
		// Initialize additional mice
		for (let i = 1; i <= 3; i++) {
			let jerryFriend = new Mouse(new THREE.Color(0x000000));
			jerryFriend.setModel(resources.get(`jerryFriend${i}`));
			// Scale Jerry's friends up
			jerryFriend.gameObject.scale.set(1.5, 1.5, 1.5);
			jerryFriends.push(jerryFriend);
		}
	});
}

function setupCameras() {
	// Camera setup for the full map
	mapCamera.fov = 60;
	mapCamera.position.set(0, 40, 40);
	mapCamera.lookAt(0, 0, 0);
	mapCamera.updateProjectionMatrix();
	scene.add(mapCamera);

	tomCamera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		100
	);

	// Initialize tomCamera
	tomCamera.position.set(0, 2, -5);
	tomCamera.lookAt(tom.gameObject.position);
	tom.gameObject.add(tomCamera);

	// Initialize jerryCamera
	jerryCamera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		100
	);
	jerryCamera.position.set(0, 1, -3);
	jerryCamera.lookAt(jerry.gameObject.position);
	jerry.gameObject.add(jerryCamera);

	// Set the initial active camera
	activeCamera = mapCamera; // Start with the map overview camera
}

function initializeCharacters() {
	// Get a random starting place for Jerry and Tom
	let startNPC = gameMap.graph.getRandomEmptyTile();
	let startPlayer = gameMap.graph.getRandomEmptyTile();

	// Set initial locations
	jerry.location = gameMap.localize(startNPC);
	tom.location = gameMap.localize(startPlayer);

	scene.add(jerry.gameObject);
	scene.add(tom.gameObject);

	jerryFriends.forEach((mouse, index) => {
		let startMouse = gameMap.graph.getRandomEmptyTile();
		mouse.location = gameMap.localize(startMouse);
		scene.add(mouse.gameObject);
	});

	// Active camera starts with the map view
	activeCamera = mapCamera;
}

function animate() {
	requestAnimationFrame(animate);

	let deltaTime = clock.getDelta();

	if (controller) controller.setWorldDirection();

	// Update characters
	jerry.update(deltaTime, gameMap, tom); // Updated to reflect new logic in jerry.js
	jerryFriends.forEach((mouse) => {
		mouse.update(deltaTime, gameMap, tom); // Ensure your Mouse class supports this update signature
	});
	tom.update(deltaTime, gameMap, controller);

	orbitControls.update();
	renderer.render(scene, activeCamera); // Use the active camera
}

setup();
