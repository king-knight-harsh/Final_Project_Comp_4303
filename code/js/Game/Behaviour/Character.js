import * as THREE from "three";
import { VectorUtil } from "../../Util/VectorUtil.js";
import { TileNode } from "../World/TileNode.js";

/**
 * Class representing a character in the game
 */
export class Character {
	/**
	 * Constructor for the Character class
	 * @param {number} mColor - The color of the character
	 * @param {GameMap} gameMap - The game map object
	 */
	constructor(mColor, gameMap) {
		// Set the size of the character
		this.size = 2;
		// Game map object
		this.gameMap = gameMap;

		// Create cone geometry and material
		let coneGeo = new THREE.ConeGeometry(this.size / 2, this.size, 10);
		let coneMat = new THREE.MeshStandardMaterial({ color: mColor });

		// Create local cone mesh
		let mesh = new THREE.Mesh(coneGeo, coneMat);
		// Increment y position
		mesh.position.y += 1;
		// Rotate mesh to face +z axis
		mesh.rotateX(Math.PI / 2);

		// Add mesh to a Group as the game object
		this.gameObject = new THREE.Group();
		this.gameObject.add(mesh);

		// Initialize movement variables
		this.location = new THREE.Vector3(0, 0, 0);
		this.velocity = new THREE.Vector3(0, 0, 0);
		this.acceleration = new THREE.Vector3(0, 0, 0);
		this.wanderAngle = null;
		this.topSpeed = 5;
		this.mass = 1;
		this.frictionMagnitude = 0;
		this.lastValidLocation = new THREE.Vector3(0, 0, 0);
	}

	/**
	 * Method to set the model for the character
	 * @param {THREE.Object3D} model - The model object
	 */
	setModel(model) {
		// Increment y position
		model.position.y += 1;
		// Rotate model to face +z axis
		let bbox = new THREE.Box3().setFromObject(model);
		let dz = bbox.max.z - bbox.min.z;
		let scale = this.size / dz;
		model.scale.set(scale, scale, scale);

		this.gameObject = new THREE.Group();
		this.gameObject.add(model);
	}

	/**
	 * Method to make the character disappear
	 */
	disappear() {
		this.gameObject.visible = false;
	}

	/**
	 * Method to make the character appear
	 */
	appear() {
		this.gameObject.visible = true;
	}

	/**
	 * Method to pursue a target character
	 * @param {Character} character - The target character to pursue
	 * @param {number} time - The time to predict target position
	 * @returns {THREE.Vector3} - The steering force to pursue the target
	 */
	pursue(character, time) {
		let prediction = VectorUtil.multiplyScalar(
			character.velocity.clone(),
			time
		);
		prediction = VectorUtil.add(prediction, character.location);
		return this.seek(prediction);
	}

	/**
	 * Method to make the character wander
	 * @returns {THREE.Vector3} - The steering force for wandering
	 */
	wander() {
		let d = 20; // Distance ahead of the current location
		let r = 5; // Radius of the circle for the wander target
		let a = 0.3; // Angle change
		// Calculate the future location
		let futureLocation = VectorUtil.multiplyScalar(this.velocity.clone(), d);
		// Add the future location to the current location
		futureLocation = VectorUtil.add(futureLocation, this.location);

		if (this.wanderAngle == null) {
			this.wanderAngle = Math.random() * (Math.PI * 2); // Initial random angle
		} else {
			let change = Math.random() * (a * 2) - a; // Random change in angle
			this.wanderAngle += change;
		}

		let target = new THREE.Vector3(
			r * Math.sin(this.wanderAngle),
			0,
			r * Math.cos(this.wanderAngle)
		);
		target = VectorUtil.add(target, futureLocation);

		return this.seek(target);
	}

	/**
	 * Method to update the character's position and velocity
	 * @param {number} deltaTime - The time since the last update
	 */
	update(deltaTime) {
		// Apply physics to the character
		this.physics();
		// Check if the character is on an obstacle
		let currentNode = this.gameMap.quantize(this.location);
		if (currentNode && currentNode.type === TileNode.Type.Obstacle) {
			console.log("Character is on an obstacle, respawning...");
			this.respawnAtRandomLocation();
		}

		this.velocity = VectorUtil.addScaledVector(
			this.velocity,
			this.acceleration,
			deltaTime
		);
		if (this.velocity.length() > 0) {
			let angle = Math.atan2(this.velocity.x, this.velocity.z);
			this.gameObject.rotation.y = angle;

			if (this.velocity.length() > this.topSpeed) {
				this.velocity = VectorUtil.setLength(this.velocity, this.topSpeed);
			}

			this.location = VectorUtil.addScaledVector(
				this.location,
				this.velocity,
				deltaTime
			);
		}

		this.gameObject.position.copy(this.location);
		this.acceleration.multiplyScalar(0);
	}

	/**
	 * Method to check if the character is at the map edges and adjust position accordingly
	 */
	checkEdges() {
		let node = this.gameMap.quantize(this.location);

		if (!node) {
			console.error("No node found at this location: ", this.location);
			this.location.copy(this.lastValidLocation);
			return;
		}

		this.lastValidLocation = this.location.clone();

		let nodeLocation = this.gameMap.localize(node);

		if (typeof node.hasEdgeTo !== "function") {
			console.error("Node does not have a hasEdgeTo function: ", node);
			return;
		}

		if (!node.hasEdgeTo(node.x - 1, node.z)) {
			let nodeEdge = nodeLocation.x - this.gameMap.tileSize / 2;
			let characterEdge = this.location.x - this.size / 2;
			if (characterEdge < nodeEdge) {
				this.location.x = nodeEdge + this.size / 2;
			}
		}

		if (!node.hasEdgeTo(node.x + 1, node.z)) {
			let nodeEdge = nodeLocation.x + this.gameMap.tileSize / 2;
			let characterEdge = this.location.x + this.size / 2;
			if (characterEdge > nodeEdge) {
				this.location.x = nodeEdge - this.size / 2;
			}
		}
		if (!node.hasEdgeTo(node.x, node.z - 1)) {
			let nodeEdge = nodeLocation.z - this.gameMap.tileSize / 2;
			let characterEdge = this.location.z - this.size / 2;
			if (characterEdge < nodeEdge) {
				this.location.z = nodeEdge + this.size / 2;
			}
		}

		if (!node.hasEdgeTo(node.x, node.z + 1)) {
			let nodeEdge = nodeLocation.z + this.gameMap.tileSize / 2;
			let characterEdge = this.location.z + this.size / 2;
			if (characterEdge > nodeEdge) {
				this.location.z = nodeEdge - this.size / 2;
			}
		}

		this.lastValidLocation.copy(this.location);
	}

	/**
	 * Method to avoid collision with obstacles
	 * @param {THREE.Object3D[]} obstacles - Array of obstacle objects
	 * @returns {THREE.Vector3} - The avoidance force
	 */
	avoidCollision(obstacles) {
		const forwardRayDirection = this.velocity.clone().normalize();
		const rayLength = 4;
		const avoidanceForce = new THREE.Vector3();
		const directions = [];

		// Create rays for four cardinal directions: forward, backward, left, and right
		const forwardRay = new THREE.Raycaster(
			this.location,
			forwardRayDirection,
			0,
			rayLength
		);
		const backwardRayDirection = forwardRayDirection.clone().negate();
		const backwardRay = new THREE.Raycaster(
			this.location,
			backwardRayDirection,
			0,
			rayLength
		);
		const rightwardDirection = new THREE.Vector3(0, 1, 0)
			.cross(forwardRayDirection)
			.normalize();
		const rightRay = new THREE.Raycaster(
			this.location,
			rightwardDirection,
			0,
			rayLength
		);
		const leftRayDirection = rightwardDirection.clone().negate();
		const leftRay = new THREE.Raycaster(
			this.location,
			leftRayDirection,
			0,
			rayLength
		);

		// Check all directions for obstacles
		directions.push({
			ray: forwardRay,
			direction: forwardRayDirection,
			open: true,
		});
		directions.push({
			ray: backwardRay,
			direction: backwardRayDirection,
			open: true,
		});
		directions.push({
			ray: rightRay,
			direction: rightwardDirection,
			open: true,
		});
		directions.push({ ray: leftRay, direction: leftRayDirection, open: true });

		// Assess each direction
		directions.forEach((dir) => {
			const intersects = dir.ray.intersectObjects(obstacles, true);
			dir.open = intersects.length === 0; // Mark direction as open if no intersections found
			dir.distance = intersects.length > 0 ? intersects[0].distance : rayLength; // Store distance to nearest obstacle
		});

		// Filter for open directions and sort by distance to obstacle (descending)
		const openDirections = directions
			.filter((dir) => dir.open)
			.sort((a, b) => b.distance - a.distance);

		if (openDirections.length > 0) {
			// If there are open directions, pick the one with the most space
			avoidanceForce
				.copy(openDirections[0].direction)
				.multiplyScalar(this.topSpeed * 3);
		} else {
			// If no open directions, pick the direction with the farthest obstacle
			const farthestObstructedDirection = directions.sort(
				(a, b) => b.distance - a.distance
			)[0];
			avoidanceForce
				.copy(farthestObstructedDirection.direction)
				.multiplyScalar(this.topSpeed * 3);
		}

		return avoidanceForce;
	}

	/**
	 * Method to apply a force to the character
	 * @param {THREE.Vector3} force - The force vector to apply
	 */
	applyForce(force) {
		let adjustedForce = VectorUtil.divideScalar(force, this.mass);
		this.acceleration = VectorUtil.add(this.acceleration, adjustedForce);
	}

	/**
	 * Method to update physics for the character
	 */
	physics() {
		this.checkEdges();
		let friction = this.velocity.clone();
		friction.y = 0;
		friction.multiplyScalar(-1);
		friction.normalize();
		friction.multiplyScalar(this.frictionMagnitude);
		this.applyForce(friction);
	}

	/**
	 * Method to seek a target position
	 * @param {THREE.Vector3} target - The target position to seek
	 * @returns {THREE.Vector3} - The steering force for seeking the target
	 */
	seek(target) {
		let desired = VectorUtil.sub(target, this.location);
		desired = VectorUtil.setLength(desired, this.topSpeed);

		let steer = VectorUtil.sub(desired, this.velocity);
		if (steer.length() > this.maxForce) {
			steer = VectorUtil.setLength(steer, this.maxForce);
		}

		return steer;
	}

	/**
	 * Method to get the current tile of the character
	 * @returns {TileNode} - The current tile node
	 */
	getCurrentTile() {
		return this.gameMap.quantize(this.location);
	}

	/**
	 * Method to respawn the character at a random location
	 */
	respawnAtRandomLocation() {
		let randomTile = this.gameMap.graph.getRandomEmptyTile();
		if (randomTile) {
			this.location = this.gameMap.localize(randomTile);
		}
	}
}
