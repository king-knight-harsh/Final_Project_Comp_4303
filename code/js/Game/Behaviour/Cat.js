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
		this.significantMoveThreshold = 10;
		this.isPowerActivated = false;
		this.topSpeed = 5;
	}

	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	update(deltaTime, controller) {
		// Check for landing on a PowerUp tile
		const currentTile = this.getCurrentTile(this.gameMap);
		const powerUpTileLocation = this.gameMap.quantize(
			this.gameMap.getPowerUpTileLocation()
		);

		if (
			powerUpTileLocation &&
			currentTile.x === powerUpTileLocation.x &&
			currentTile.z === powerUpTileLocation.z &&
			!this.gameMap.isPowerUPTileActive()
		) {
			this.powerUP();
			setTimeout(() => {
				this.removePowerUp();
			}, 6000);
		}

		super.update(deltaTime, this.gameMap);
		this.state.updateState(this, controller);
	}

	getCurrentTile() {
		return this.gameMap.quantize(this.location);
	}

	setSpeed(topSpeed) {
		this.topSpeed = topSpeed;
	}

	movedSignificantly() {
		return this.hasMovedSignificantly;
	}

	async powerUP() {
		console.log("Cat PowerUp activated");
		await this.gameMap.activatePowerUPTile();
		this.isPowerActivated = true;
		await this.setSpeed(10);
	}

	removePowerUp() {
		this.isPowerActivated = false;
		console.log("Cat PowerUp deactivated");
		this.setSpeed(5);
		this.gameMap.resetPowerUPTile();
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
