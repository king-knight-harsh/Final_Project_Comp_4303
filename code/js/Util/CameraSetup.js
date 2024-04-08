import * as THREE from "three";

/**
 * Initializes and sets up the cameras for a 3D scene, including a full map view camera and a character-focused camera.
 * This function configures two distinct camera views within a THREE.js scene: one that provides an overhead view of the entire map (mapCamera),
 * and another that focuses on a character named Tom (tomCamera). The active camera is initially set to provide a full map overview.
 *
 * @param {THREE.PerspectiveCamera} mapCamera - The camera used for the overhead view of the map. This camera is adjusted within the function
 *                                              but should be initialized before being passed in.
 * @param {THREE.PerspectiveCamera} tomCamera - A reference to the camera that will be initialized within the function to focus on Tom.
 *                                              This parameter is used to return the initialized tomCamera.
 * @param {THREE.Camera} activeCamera - A reference to the currently active camera. This function sets the initial active camera.
 * @param {Object} tom - An object representing the character Tom, which must have a `gameObject` property with a `position` attribute
 *                       that tomCamera will use for its focus.
 * @param {THREE.Scene} scene - The scene to which the mapCamera will be added. The tomCamera is added to Tom's gameObject, so it moves with him.
 *
 */
export function setupCameras(mapCamera, tomCamera, activeCamera, tom, scene) {
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

	// Set the initial active camera
	activeCamera = mapCamera; // Start with the map overview camera
}
