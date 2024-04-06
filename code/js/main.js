// Import necessary components
import * as THREE from "three";
import { GameMap } from "./Game/World/GameMap.js";
import { Mouse } from "./Game/Behaviour/Jerry.js";
import { Tom } from "./Game/Behaviour/Tom.js";
import { Controller } from "./Game/Behaviour/Controller.js"; // Ensure this is your updated Controller
import { Resources } from "./Util/Resources.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { resourceFiles } from "./Util/ResourceFile.js";
import {Dog} from "./Game/Behaviour/Dog.js"

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
let tom = new Tom(new THREE.Color(0xff0000));
let jerry = new Mouse(new THREE.Color(0x000000));
let dog = new Dog(new THREE.Color(0xff0023))
let jerryFriends = []; // Assuming initialization of Jerry's friends happens later

// Radius for capture
let captureRadius = 1;

const resources = new Resources(resourceFiles);

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
		dog.setModel(resources.get("spike"))
		jerry.setModel(resources.get("jerry"));
		// Scale Jerry down
		jerry.gameObject.scale.set(0.5, 0.5, 0.5);
		dog.gameObject.scale.set(1,1,1)
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
	let dogPlayer = gameMap.graph.getRandomEmptyTile();
	// Set initial locations
	jerry.location = gameMap.localize(startNPC);
	tom.location = gameMap.localize(startPlayer);
	dog.location = gameMap.localize(dogPlayer);
	const dogOffset = 0.5; // Adjust this value as needed
    dog.gameObject.position.copy(dog.location).add(new THREE.Vector3(0, dogOffset, 0));
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

function animate() {
	requestAnimationFrame(animate);
	
	let deltaTime = clock.getDelta();

	if (controller) controller.setWorldDirection();
	
	let steer = dog.wander();
	let dogTile = gameMap.quantize(dog.location);
	let tomTile;
	if (tom)
	{
		tomTile = gameMap.quantize(tom.location);
	}
	else
	{
		return;
	}
	
    
    let path = gameMap.astar(dogTile, tomTile);
	
	// Update characters
	if (jerry) {
		
		let steer_for_jerry = jerry.evade(tom, deltaTime);
	    jerry.applyForce(steer_for_jerry);
		jerry.update(deltaTime, gameMap, tom);
		// Check for Power-Up tile interaction
		gameMap.checkCharacterTile(gameMap.quantize(jerry.location), jerry);
	}
	
	jerryFriends.forEach((mouse) => {
		if (mouse) {
			let steer_for_mouses = mouse.evade(tom, deltaTime);
	        mouse.applyForce(steer_for_mouses);
			mouse.update(deltaTime, gameMap, tom);
			// Each friend checks for Power-Up tile
			gameMap.checkCharacterTile(gameMap.quantize(mouse.location), mouse);
		}
	});
	tom.update(deltaTime, gameMap, controller);
	// Tom checks for Power-Up tile
	gameMap.checkCharacterTile(gameMap.quantize(tom.location), tom);
	if (path && path.length > 1) {
        // Get the next tile in the path
        let nextTile = path[1];

        // Calculate the position of the center of the next tile
        let nextPosition = gameMap.localize(nextTile);

        // Steer the dog towards the next position
        steer = dog.seek(nextPosition);
    }

	dog.applyForce(steer);

	// Update our character
	dog.update(deltaTime,gameMap);
	// Update Tom, Jerry, and Jerry's friends
	checkForCapture();

	orbitControls.update();

	renderer.render(scene, activeCamera); // Use the active camera
}

function checkForCapture() {
	// Check if Jerry has been captured
	
	if (jerry && tom.location.distanceTo(jerry.location) < captureRadius) {
		console.log("Tom has caught Jerry!");
		scene.remove(jerry.gameObject);
		jerry = null;// Remove Jerry from the scene
		 // Setting jerry to null to indicate capture
	}

	// Filter Jerry's friends to remove any that Tom catches
	jerryFriends = jerryFriends.filter((friend) => {
		if (tom.location.distanceTo(friend.location) < captureRadius) {
			console.log("Tom has caught a friend!");
			scene.remove(friend.gameObject);
			return false; // This friend is caught, remove from array
		}
		return true; // This friend remains uncaptured, keep in array
	});

	if (tom && dog.location.distanceTo(tom.location)<captureRadius)
	{
		console.log("spike has captured tom")
		scene.remove(tom.gameObject)
		tom = null;
	}

	checkForReset();
}

function checkForReset() {
	if ((!jerry && jerryFriends.length === 0) || !tom) {
		resetGame();
		return;
	}

}

function resetGame() {
	// Create modal HTML
	const modalHTML = `
        <div class="modal fade" id="gameOverModal" tabindex="-1" aria-labelledby="gameOverModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="gameOverModalLabel">Game Over</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        All characters have been caught!
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="restartBtn">Restart</button>
                    </div>
                </div>
            </div>
        </div>
    `;

	// Append modal HTML to document body
	document.body.insertAdjacentHTML("beforeend", modalHTML);

	// Show the modal
	const modal = new bootstrap.Modal(document.getElementById("gameOverModal"));
	modal.show();

	// Set the opacity of the modal backdrop inline
	const modalBackdrop = document.querySelector(".modal-backdrop");
	if (modalBackdrop) {
		modalBackdrop.style.opacity = "0"; // Adjust the opacity value as needed
	}

	// Add event listener to restart button
	const restartBtn = document.getElementById("restartBtn");
	restartBtn.addEventListener("click", () => {
		// Refresh the page to restart the game
		location.reload();
	});
}

setup();
