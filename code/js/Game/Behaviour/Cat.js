import { Character } from "./Character.js";
import { State } from "./State.js";
import * as THREE from "three"; // Assuming State.js exports these

export class Tom extends Character {
	constructor(color, gameMap) {
		super(color, gameMap);
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
		// Check for landing on a PowerUp tile
		const currentTile = this.getCurrentTile(gameMap);
		const powerUpTileLocation = gameMap.getPowerUpTileLocation();
		if (
			powerUpTileLocation &&
			currentTile.x === powerUpTileLocation.x &&
			currentTile.z === powerUpTileLocation.z &&
			!this.isPowerActivated
		) {
			this.state = new CatPowerUp();
		}

		console.log(this.state.constructor.name); // Debugging
		super.update(deltaTime, gameMap);
		this.state.updateState(this, controller);
	}

	getCurrentTile(gameMap) {
		return gameMap.quantize(this.location);
	}

	setSpeed(topSpeed) {
		this.topSpeed = topSpeed;
	}

	movedSignificantly() {
		return this.hasMovedSignificantly;
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

export class CatPowerUp extends State {
	enterState(character) {
		character.setSpeed(10);
		character.gameMap.activatePowerUPTile();
		character.isPowerActivated = true;
		setTimeout(() => {
			character.state = new RemoveCatPowerUp();
		}, 6000);
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class RemoveCatPowerUp extends State {
	enterState(character) {
		character.setSpeed(5);
		character.gameMap.resetPowerUPTile();
		character.state = new IdleState(character);
		character.isPowerActivated = false;
	}

	updateState(character) {
		this.enterState(character);
	}
}
