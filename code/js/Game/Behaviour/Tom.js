import { Character } from "./Character.js";
import { State } from "./State.js";
import * as THREE from "three"; // Assuming State.js exports these

export class Tom extends Character {
	constructor(colour) {
		super(colour);
		this.frictionMagnitude = 20;

		// State
		this.state = new IdleState();
		this.state.enterState(this);

		// Add properties to track movement
		this.previousPosition = new THREE.Vector3();
		this.significantMoveThreshold = 10; // Define what you consider a "significant move"
	}

	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	update(deltaTime, gameMap, controller) {
		this.state.updateState(this, controller);
		super.update(deltaTime, gameMap);

		// After updating, check if moved significantly
		if (
			this.location.distanceTo(this.previousPosition) >
			this.significantMoveThreshold
		) {
			this.previousPosition.copy(this.location); // Update previous position to current
			this.hasMovedSignificantly = true;
		} else {
			this.hasMovedSignificantly = false;
		}
	}

	getCurrentTile(gameMap) {
		return gameMap.quantize(this.location);
	}

	movedSignificantly() {
		return this.hasMovedSignificantly;
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
}

export class IdleState extends State {
	enterState(player) {
		player.velocity.x = 0;
		player.velocity.z = 0;
	}

	updateState(player, controller) {
		if (controller.moving()) {
			player.switchState(new MovingState());
		}
	}
}

export class MovingState extends State {
	enterState(player) {}

	updateState(player, controller) {
		if (!controller.moving()) {
			player.switchState(new IdleState());
		} else {
			let force = controller.direction();
			force.setLength(50);
			player.applyForce(force);
		}
	}
}
