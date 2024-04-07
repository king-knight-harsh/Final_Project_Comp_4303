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

		this.isPowerActivated = false;
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

	disappear() {
		// Hide the mouse character or remove it from the scene
		this.gameObject.visible = false; // Assuming gameObject is a property that references the Three.js mesh of the mouse character
	}

	// Method to make the mouse reappear
	appear() {
		// Show the mouse character or add it back to the scene
		this.gameObject.visible = true; // Assuming gameObject is a property that references the Three.js mesh of the mouse character
	}

	pursue(character, time) {
		let prediction = new THREE.Vector3(0, 0, 0);
		prediction.addScaledVector(character.velocity, time);
		prediction.add(character.location);

		return this.seek(prediction);
	}

	// update character
	wander() {
		let d = 20;
		let r = 5;
		let a = 0.3;

		let futureLocation = this.velocity.clone();
		futureLocation.setLength(d);
		futureLocation.add(this.location);

		if (this.wanderAngle == null) {
			this.wanderAngle = Math.random() * (Math.PI * 2);
		} else {
			let change = Math.random() * (a * 2) - a;
			this.wanderAngle = this.wanderAngle + change;
		}

		let target = new THREE.Vector3(
			r * Math.sin(this.wanderAngle),
			0,
			r * Math.cos(this.wanderAngle)
		);
		target.add(futureLocation);
		return this.seek(target);
	}

	update(deltaTime, gameMap) {
		this.physics(gameMap);

		// Additional logic to check for being stuck on an obstacle
		let currentNode = gameMap.quantize(this.location);
		if (currentNode && currentNode.type === TileNode.Type.Obstacle) {
			console.log("Character is on an obstacle, respawning...");
			this.respawnAtRandomLocation();
		}
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

		// Assuming you keep track of the last valid node/location
		if (!node) {
			console.error("No node found at this location: ", this.location);
			// Move character back to the last valid node or a default position
			this.location.copy(this.lastValidLocation);
			return; // Early return to avoid further processing
		}

		// Update lastValidLocation with current location after successful edge checks
		this.lastValidLocation = this.location.clone();

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

		this.lastValidLocation.copy(this.location);
	}

	avoidCollision(obstacles, time) {
		// An empty steering behaviour
		let steer = new THREE.Vector3();
		let prediction;
		let total = new THREE.Vector3();
		let prediction_1;
		let prediction_3;

		for (let i = 0; i < obstacles.length; i++) {
			prediction = VectorUtil.addScaledVector(
				this.location,
				this.velocity,
				time
			);

			let futureLocation = this.velocity.clone();
			futureLocation.setLength(5);
			futureLocation.add(this.location);
			let angle = Math.atan2(this.velocity.x, this.velocity.z);
			let newa = angle + Math.PI / 4;
			let newb = angle - Math.PI / 4;

			prediction_1 = new THREE.Vector3(
				5 * Math.sin(newa),
				0,
				5 * Math.cos(newa)
			);
			prediction_1.add(futureLocation);
			prediction_3 = new THREE.Vector3(
				5 * Math.sin(newb),
				0,
				5 * Math.cos(newb)
			);
			prediction_3.add(futureLocation);

			// Get the obstacle position and radius
			let obstaclePosition = obstacles[i].position;
			let obstacleRadius = obstacles[i].geometry.parameters.radius;

			// Try and get the collision
			let collisionPoint = this.getCollision(
				obstaclePosition,
				obstacleRadius,
				prediction
			);
			let collisionPoint_1 = this.getCollision(
				obstaclePosition,
				obstacleRadius,
				prediction_1
			);
			let collisionPoint_2 = this.getCollision(
				obstaclePosition,
				obstacleRadius,
				prediction_3
			);

			if (collisionPoint != null) {
				let distance = collisionPoint.distanceTo(this.location);
				if (distance < nearestCollisionDistance) {
					nearestCollisionPoint = collisionPoint;
					nearestCollisionDistance = distance;
				}
				let normal = VectorUtil.sub(collisionPoint, obstaclePosition);
				// I chose 5 as the distance of how
				// far away to seek from the obstacle edge
				normal.setLength(30);
				// Where to seek to avoid colliding
				let target = VectorUtil.add(collisionPoint, normal);
				steer = this.seek(target);
				total.add(steer);
			}
			if (collisionPoint_1 != null) {
				let distance = collisionPoint.distanceTo(this.location);
				if (distance < nearestCollisionDistance) {
					nearestCollisionPoint = collisionPoint;
					nearestCollisionDistance = distance;
				}

				let normal = VectorUtil.sub(collisionPoint_1, obstaclePosition);
				normal.setLength(30);
				let target = VectorUtil.add(collisionPoint_1, normal);
				steer = this.seek(target);
				total.add(steer);
			}
			if (collisionPoint_2 != null) {
				let distance = collisionPoint.distanceTo(this.location);
				if (distance < nearestCollisionDistance) {
					nearestCollisionPoint = collisionPoint;
					nearestCollisionDistance = distance;
				}

				let normal = VectorUtil.sub(collisionPoint_2, obstaclePosition);
				// I chose 5 as the distance of how
				// far away to seek from the obstacle edge
				normal.setLength(30);
				// Where to seek to avoid colliding
				let target = VectorUtil.add(collisionPoint_2, normal);
				steer = this.seek(target);
				total.add(steer);
			}
		}

		// This method is for debugging!
		// You can use it to draw your rays
		// and check for collisions
		let hit = total.length() !== 0;
		this.debugLine(this.location, prediction, prediction_1, prediction_3, hit);
		if (nearestCollisionPoint) {
			return total;
		}

		// Returns the steering force
		return total;
	}

	/**

	Attempts to get the collision point

	Takes in the obstacle position, obstacle radius
	and prediction of where the character will be in the future

	**/
	getCollision(obstaclePosition, obstacleRadius, prediction) {
		// If the character itself is colliding with the obstacle
		if (
			CollisionDetector.circlePoint(
				this.location,
				obstaclePosition,
				obstacleRadius
			)
		) {
			// The collision point is the difference between the
			// characters location and the obstacle's center
			// set at a length of the obstacle's radius
			let collisionPoint = VectorUtil.sub(this.location, obstaclePosition);
			collisionPoint.setLength(obstacleRadius);
			collisionPoint.add(obstaclePosition);
			return collisionPoint;
		}
		// Get the vector between obstacle position and current location
		let vectorA = VectorUtil.sub(obstaclePosition, this.location);
		// Get the vector between prediction and current location
		let vectorB = VectorUtil.sub(prediction, this.location);

		// find the vector projection
		// this method projects vectorProjection (vectorA) onto vectorB
		// and sets vectorProjection to the its result
		let vectorProjection = VectorUtil.projectOnVector(vectorA, vectorB);
		vectorProjection.add(this.location);

		// get the adjacent using trigonometry
		let opp = obstaclePosition.distanceTo(vectorProjection);
		let adj = Math.sqrt(obstacleRadius * obstacleRadius - opp * opp);

		// use scalar projection to get the collision length
		let scalarProjection = vectorProjection.distanceTo(this.location);
		let collisionLength = scalarProjection - adj;

		// find the collision point by setting
		// vectorB to the collision length
		// then adding the current location
		let collisionPoint = VectorUtil.setLength(vectorB, collisionLength);
		collisionPoint.add(this.location);

		// Tests to see if the collision point is
		// 1) on the line and 2) within the obstacle
		if (
			CollisionDetector.linePoint(this.location, prediction, collisionPoint) &&
			CollisionDetector.circlePoint(
				collisionPoint,
				obstaclePosition,
				obstacleRadius
			)
		) {
			return collisionPoint;
		}
		// Return null if there is no collision
		return null;
	}

	/**

	This method does two things:
	1. Draws a line to show the predicted ray 
		for collision testing
	2. Sets the character colour based on
		whether they or their predicted ray 
		has collided with an obstacle

	Takes in four vectors:
	v1: the current character location
	v2: the prediction (or end of the vector)
	w1: the end of whisker 1
	v2: the end of whisker 2

	and takes in a "hit" boolean of whether 
	the character or their predicted ray 
	has hit an obstacle

  	**/
	debugLine(v1, v2, w1, w2, hit) {
		if (this.ray !== null) {
			this.scene.remove(this.ray);
			this.scene.remove(this.ray1);
			this.scene.remove(this.ray2);
		}

		let points = [];

		points.push(v1);
		points.push(v2);

		// Creates the central ray
		let material = new THREE.MeshBasicMaterial({ color: 0x000000 });
		let geometry = new THREE.BufferGeometry().setFromPoints(points);
		this.ray = new THREE.Line(geometry, material);
		this.scene.add(this.ray);

		if (w1 != null) {
			points = [];
			points.push(v1);
			points.push(w1);

			// Creates the whisker1 ray

			geometry = new THREE.BufferGeometry().setFromPoints(points);

			this.ray1 = new THREE.Line(geometry, material);
			// Adds the ray to the scene

			this.scene.add(this.ray1);
		}

		if (w2 != null) {
			points = [];

			points.push(v1);
			points.push(w2);

			// Creates the whisker2 ray
			geometry = new THREE.BufferGeometry().setFromPoints(points);
			this.ray2 = new THREE.Line(geometry, material);

			// Adds the ray to the scene
			this.scene.add(this.ray2);
		}

		if (hit) {
			this.gameObject.children[0].material = new THREE.MeshStandardMaterial({
				color: 0xff0000,
			});
		} else {
			this.gameObject.children[0].material = new THREE.MeshStandardMaterial({
				color: 0x00ff00,
			});
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

	seek(target) {
		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		desired.setLength(this.topSpeed);

		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

		if (steer.length() > this.maxForce) {
			steer.setLength(this.maxForce);
		}

		return steer;
	}

	getCurrentTile(gameMap) {
		return gameMap.quantize(this.location);
	}

	respawnAtRandomLocation() {
		let randomTile = this.gameMap.graph.getRandomEmptyTile();
		if (randomTile) {
			this.location = this.gameMap.localize(randomTile);
		}
	}
}
