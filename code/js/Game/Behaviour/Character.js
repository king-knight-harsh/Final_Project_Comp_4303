import * as THREE from "three";
import { VectorUtil } from "../../Util/VectorUtil.js";
import { TileNode } from "../World/TileNode.js";
export class Character {
	// Character Constructor
	constructor(mColor, gameMap) {
		this.size = 2;

		this.gameMap = gameMap;
		// Create our cone geometry and material
		let coneGeo = new THREE.ConeGeometry(this.size / 2, this.size, 10);
		let coneMat = new THREE.MeshStandardMaterial({ color: mColor });

		// Create the local cone mesh (of type Object3D)
		let mesh = new THREE.Mesh(coneGeo, coneMat);
		// Increment the y position so our cone is just atop the y origin
		mesh.position.y = mesh.position.y + 1;
		// Rotate our X value of the mesh so it is facing the +z axis
		mesh.rotateX(Math.PI / 2);

		// Add our mesh to a Group to serve as the game object
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
		this.ray = null;
		this.ray1 = null;
		this.ray2 = null;
		this.whiskerAngle = Math.PI / 3;
		this.lastValidLocation = new THREE.Vector3(0, 0, 0);
	}

	setModel(model) {
		model.position.y = model.position.y + 1;

		var bbox = new THREE.Box3().setFromObject(model);

		let dz = bbox.max.z - bbox.min.z;

		let scale = this.size / dz;
		model.scale.set(scale, scale, scale);

		this.gameObject = new THREE.Group();
		this.gameObject.add(model);
	}

	disappear() {
		this.gameObject.visible = false;
	}

	appear() {
		this.gameObject.visible = true;
	}

	pursue(character, time) {
		let prediction = VectorUtil.multiplyScalar(
			character.velocity.clone(),
			time
		);
		prediction = VectorUtil.add(prediction, character.location);
		return this.seek(prediction);
	}

	wander() {
		let d = 20; // Distance ahead of the current location
		let r = 5; // Radius of the circle for the wander target
		let a = 0.3; // Angle change

		let futureLocation = VectorUtil.multiplyScalar(this.velocity.clone(), d);
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

	update(deltaTime) {
		this.physics();

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
			if (this.velocity.x != 0 || this.velocity.z != 0) {
				let angle = Math.atan2(this.velocity.x, this.velocity.z);
				this.gameObject.rotation.y = angle;
			}

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

	checkEdges() {
		let node = this.gameMap.quantize(this.location);

		// Assuming you keep track of the last valid node/location
		if (!node) {
			console.error("No node found at this location: ", this.location);
			// Move character back to the last valid node or a default position
			this.location.copy(this.lastValidLocation);
			return; // Early return to avoid further processing
		}

		// Update lastValidLocation with current location after successful edge checks
		this.lastValidLocation = this.location.clone();

		let nodeLocation = this.gameMap.localize(node);

		// Add a guard clause to ensure node has the hasEdgeTo method
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

	avoidCollision(obstacles) {
		// Define the forward ray for collision detection
		const forwardRayDirection = this.velocity.clone().normalize();
		const forwardRayLength = 3; // Length of the ray

		// Create a Raycaster for the forward ray
		const forwardRay = new THREE.Raycaster(
			this.location,
			forwardRayDirection,
			0,
			forwardRayLength
		);
		const intersects = forwardRay.intersectObjects(obstacles, true);

		let avoidanceForce = new THREE.Vector3();

		if (intersects.length > 0) {
			const rightwardDirection = new THREE.Vector3(0, -1, 0)
				.cross(forwardRayDirection)
				.normalize();

			// Apply the top speed to the rightward direction for the avoidance force
			avoidanceForce.copy(rightwardDirection).multiplyScalar(this.topSpeed * 2);
		}

		return avoidanceForce;
	}

	applyForce(force) {
		let adjustedForce = VectorUtil.divideScalar(force, this.mass);
		this.acceleration = VectorUtil.add(this.acceleration, adjustedForce);
	}

	physics() {
		this.checkEdges();
		// friction
		let friction = this.velocity.clone();
		friction.y = 0;
		friction.multiplyScalar(-1);
		friction.normalize();
		friction.multiplyScalar(this.frictionMagnitude);
		this.applyForce(friction);
	}

	seek(target) {
		let desired = VectorUtil.sub(target, this.location);
		desired = VectorUtil.setLength(desired, this.topSpeed);

		let steer = VectorUtil.sub(desired, this.velocity);
		if (steer.length() > this.maxForce) {
			steer = VectorUtil.setLength(steer, this.maxForce);
		}

		return steer;
	}

	getCurrentTile() {
		return this.gameMap.quantize(this.location);
	}

	respawnAtRandomLocation() {
		let randomTile = this.gameMap.graph.getRandomEmptyTile();
		if (randomTile) {
			this.location = this.gameMap.localize(randomTile);
		}
	}
}
