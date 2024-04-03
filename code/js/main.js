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
		if (activeCamera === tomCamera) {
			activeCamera = jerryCamera;
		} else if (activeCamera === jerryCamera) {
			activeCamera = mapCamera; // Switch to the full map camera
		} else {
			activeCamera = tomCamera;
		}
	}
});

// Setup our scene
function setup() {
	scene.background = new THREE.Color(0xffffff);

	// Light setup
	let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.set(50, 100, 50);
	scene.add(directionalLight);

	gameMap.init(scene);
	scene.add(gameMap.gameObject);

	// Set models for characters
	jerry.setModel(resources.get("mouse1"));
	tom.setModel(resources.get("cat"));

	mapCamera.fov = 60; // A smaller field of view makes things appear bigger
	mapCamera.position.set(0, 40, 40); // Closer position might give a better view of larger elements
	mapCamera.lookAt(0, 0, 0);
	mapCamera.updateProjectionMatrix();
	scene.add(mapCamera);

	// Camera setup for each character
	tomCamera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		100
	);
	jerryCamera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		100
	);
	tom.gameObject.add(tomCamera);
	jerry.gameObject.add(jerryCamera);
	// Assuming models have been positioned correctly; adjust as needed
	tomCamera.position.set(0, 2, 1); // Adjust Y for "height" and Z for "forward/backward" relative to the model
	tomCamera.lookAt(new THREE.Vector3(0, 2, 2)); // Adjust based on the model's scale
	jerryCamera.position.set(0, 1, 0); // Adjust based on the model's scale
	//activeCamera = tomCamera; // Start with Tom's camera
	activeCamera = mapCamera;
	// Position and scale adjustments as necessary
	jerry.gameObject.scale.set(2, 2, 2); // Example scaling
	tom.gameObject.scale.set(2, 2, 2); // Example scaling

	scene.add(jerry.gameObject);
	scene.add(tom.gameObject);

	// Get a random starting place for the enemy
	let startNPC = gameMap.graph.getRandomEmptyTile();
	let startPlayer = gameMap.graph.getRandomEmptyTile();

	// this is where we start the NPC
	jerry.location = gameMap.localize(startNPC);

	// this is where we start the player
	tom.location = gameMap.localize(startPlayer);

	jerry.path = gameMap.astar(startNPC, startPlayer);

	//First call to animate
	animate();
}

function animate() {
	requestAnimationFrame(animate);

	let deltaTime = clock.getDelta();

	// Update characters
	let steer = jerry.followPlayer(gameMap, tom);
	//jerry.applyForce(steer);
	jerry.update(deltaTime, gameMap);
	tom.update(deltaTime, gameMap, controller);
	orbitControls.update();
	renderer.render(scene, activeCamera); // Use the active camera
}

setup();
