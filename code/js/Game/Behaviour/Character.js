import * as THREE from "three";
import { VectorUtil } from "../../Util/VectorUtil.js";

export class Character {
	// Character Constructor
	constructor(mColor) {
		this.size = 2;

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

		this.topSpeed = 5;
		this.mass = 1;
		this.frictionMagnitude = 0;
	}

	// Set the model for the character
	setModel(model) {
		model.position.y = model.position.y + 1;
		// Bounding box for the object
		var bbox = new THREE.Box3().setFromObject(model);

		// Get the depth of the object for avoiding collisions
		// Of course we could use a bounding box,
		// but for now we will just use one dimension as "size"
		// (this would work better if the model is square)
		let dz = bbox.max.z - bbox.min.z;

		// Scale the object based on how
		// large we want it to be
		let scale = this.size / dz;
		model.scale.set(scale, scale, scale);

		this.gameObject = new THREE.Group();
		this.gameObject.add(model);
	}
	// update character
	update(deltaTime, gameMap) {
		this.physics(gameMap);
		// update velocity via acceleration
		this.velocity.addScaledVector(this.acceleration, deltaTime);

		if (this.velocity.length() > 0) {
			// rotate the character to ensure they face
			// the direction of movement
			if (this.velocity.x != 0 || this.velocity.z != 0) {
				let angle = Math.atan2(this.velocity.x, this.velocity.z);
				this.gameObject.rotation.y = angle;
			}

			if (this.velocity.length() > this.topSpeed) {
				this.velocity.setLength(this.topSpeed);
			}

			// update location via velocity
			this.location.addScaledVector(this.velocity, deltaTime);
		}

		// set the game object position
		this.gameObject.position.set(
			this.location.x,
			this.location.y,
			this.location.z
		);
		this.acceleration.multiplyScalar(0);
	}

	// check edges
	checkEdges(gameMap) {
		let node = gameMap.quantize(this.location);

		// If the node is undefined, either return early or handle accordingly
		if (!node) {
			console.error("No node found at this location: ", this.location);
			return; // Return early to prevent further execution
		}

		let nodeLocation = gameMap.localize(node);

		// Add a guard clause to ensure node has the hasEdgeTo method
		if (typeof node.hasEdgeTo !== "function") {
			console.error("Node does not have a hasEdgeTo function: ", node);
			return;
		}

		if (!node.hasEdgeTo(node.x - 1, node.z)) {
			let nodeEdge = nodeLocation.x - gameMap.tileSize / 2;
			let characterEdge = this.location.x - this.size / 2;
			if (characterEdge < nodeEdge) {
				this.location.x = nodeEdge + this.size / 2;
			}
		}

		if (!node.hasEdgeTo(node.x + 1, node.z)) {
			let nodeEdge = nodeLocation.x + gameMap.tileSize / 2;
			let characterEdge = this.location.x + this.size / 2;
			if (characterEdge > nodeEdge) {
				this.location.x = nodeEdge - this.size / 2;
			}
		}
		if (!node.hasEdgeTo(node.x, node.z - 1)) {
			let nodeEdge = nodeLocation.z - gameMap.tileSize / 2;
			let characterEdge = this.location.z - this.size / 2;
			if (characterEdge < nodeEdge) {
				this.location.z = nodeEdge + this.size / 2;
			}
		}

		if (!node.hasEdgeTo(node.x, node.z + 1)) {
			let nodeEdge = nodeLocation.z + gameMap.tileSize / 2;
			let characterEdge = this.location.z + this.size / 2;
			if (characterEdge > nodeEdge) {
				this.location.z = nodeEdge - this.size / 2;
			}
		}
	}

	// Apply force to our character
	applyForce(force) {
		// here, we are saying force = force/mass
		force.divideScalar(this.mass);
		// this is acceleration + force/mass
		this.acceleration.add(force);
	}

	// simple physics
	physics(gameMap) {
		this.checkEdges(gameMap);
		// friction
		let friction = this.velocity.clone();
		friction.y = 0;
		friction.multiplyScalar(-1);
		friction.normalize();
		friction.multiplyScalar(this.frictionMagnitude);
		this.applyForce(friction);
	}
}
