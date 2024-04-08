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
import { setupCameras } from "./Util/CameraSetup.js";
import { initializeCharacters } from "./Util/InitializeCharacter.js";
import { CheckForCapture } from "./Game/Behaviour/State.js";

// Create Scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let checkForCaptureState = new CheckForCapture();

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

let tomCamera;
let activeCamera = mapCamera;
let controller;

// Characters

let dog, tom;
let jerryAndFriends = [];

const resources = new Resources(resourceFiles);

// Setup our scene
async function setup() {
  scene.background = new THREE.Color(0xffffff);

  // Light setup
  let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(50, 100, 50);
  scene.add(directionalLight);

  gameMap.init(scene, 20);

  tom = new Tom(new THREE.Color(0xff0000), gameMap);

  dog = new Dog(new THREE.Color(0xff0023), gameMap, tom);

  // Camera setup
  setupCameras(mapCamera, tomCamera, activeCamera, tom, scene);

  controller = new Controller(document, activeCamera);

  // Model setup
  await setupModels();

  initializeCharacters(
    gameMap,
    tom,
    dog,
    jerryAndFriends,
    scene,
    mapCamera,
    activeCamera
  );

  // Start animation loop
  animate();
}

// Load models asynchronously
async function setupModels() {
  await resources.loadAll().then(() => {
    // Set models for dog and Tom
    dog.setModel(resources.get("spike"));
    dog.gameObject.scale.set(1, 1, 1);
    tom.setModel(resources.get("tom"));

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

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  let deltaTime = clock.getDelta();

  // Update all characters
  jerryAndFriends.forEach((mouse) => {
    if (mouse) {
      mouse.update(deltaTime);
      // Each friend checks for Power-Up tile
    }
  });
  if (tom) {
    tom.update(deltaTime, controller);
  }
  dog.update(deltaTime);

  // Check for capture
  checkForCaptureState.enterState(tom, jerryAndFriends, dog, scene);

  orbitControls.update();

  renderer.render(scene, activeCamera); // Use the active camera
}

setup();
