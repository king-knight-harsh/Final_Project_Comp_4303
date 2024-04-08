import * as THREE from "three";

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
