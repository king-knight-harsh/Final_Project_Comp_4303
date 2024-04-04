import * as THREE from "three";
import { GameMap } from "./Game/World/GameMap.js";
import { NPC } from "./Game/Behaviour/Jerry.js";
import { Player } from "./Game/Behaviour/Tom.js";
import { Controller } from "./Game/Behaviour/Controller.js";
import { Resources } from "./Util/Resources.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Create Scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let tomCamera, jerryCamera, activeCamera;

// Adding full map camera setup
const mapCamera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const orbitControls = new OrbitControls(mapCamera, renderer.domElement);
mapCamera.position.set(0, 100, 0); // Position above the center of the map
mapCamera.lookAt(scene.position); // Look at the center of the scene

// Create GameMap, clock, controller, and characters
const gameMap = new GameMap();
const clock = new THREE.Clock();
const controller = new Controller(document);
const tom = new Player(new THREE.Color(0xff0000));
let jerry = new NPC(new THREE.Color(0x000000));

// Resource loading
let files = [
	{ name: "cat", url: "/Models/cat.glb" },
	{ name: "mouse1", url: "/Models/mouse1.glb" },
];
const resources = new Resources(files);
await resources.loadAll();

// Keybinding for camera switch
document.addEventListener("keydown", (event) => {
	if (event.key === "c" || event.key === "C") {
		activeCamera =
			activeCamera === tomCamera
				? jerryCamera
				: activeCamera === jerryCamera
				? mapCamera
				: tomCamera;
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

	// Set models for characters
	await resources.loadAll().then(() => {
		jerry.setModel(resources.get("mouse1"));
		tom.setModel(resources.get("cat"));
	});

	// Camera setup
	setupCameras();

	// Initial positions
	initializeCharacters();

	// Start animation loop
	animate();
}

function setupCameras() {
	// Camera setup for the full map
	mapCamera.fov = 60;
	mapCamera.position.set(0, 40, 40);
	mapCamera.lookAt(0, 0, 0);
	mapCamera.updateProjectionMatrix();
	scene.add(mapCamera);

	// Camera setup for Tom
	tomCamera = new THREE.PerspectiveCamera(
		75, // Field of view
		window.innerWidth / window.innerHeight, // Aspect ratio
		0.1, // Near clipping plane
		100 // Far clipping plane
	);
	// Position the Tom camera slightly above and behind Tom
	tomCamera.position.set(0, 2, -5);
	tomCamera.lookAt(tom.gameObject.position);
	tom.gameObject.add(tomCamera);

	// Camera setup for Jerry
	jerryCamera = new THREE.PerspectiveCamera(
		75, // Field of view
		window.innerWidth / window.innerHeight, // Aspect ratio
		0.1, // Near clipping plane
		100 // Far clipping plane
	);
	// Position the Jerry camera slightly above and behind Jerry
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

	// Active camera starts with the map view
	activeCamera = mapCamera;
}

function animate() {
	requestAnimationFrame(animate);

	let deltaTime = clock.getDelta();

	// Update characters
	jerry.update(deltaTime, gameMap, tom); // Updated to reflect new logic in jerry.js
	tom.update(deltaTime, gameMap, controller);

	orbitControls.update();
	renderer.render(scene, activeCamera); // Use the active camera
}

setup();
