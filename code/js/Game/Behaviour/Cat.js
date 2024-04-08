import { Character } from "./Character.js";
import { State } from "./State.js";
import * as THREE from "three";

export class Tom extends Character {
	/**
	 * Constructor for the Tom class
	 * @param {number} color - The color of Tom
	 * @param {GameMap} gameMap - The game map object
	 */
	constructor(color, gameMap) {
		super(color, gameMap);
		this.frictionMagnitude = 20;

		// State
		this.state = new IdleState();
		this.state.enterState(this);

		// Additional properties to track movement
		this.previousPosition = new THREE.Vector3();
		this.significantMoveThreshold = 10;
		this.isPowerActivated = false;
		this.topSpeed = 5;
	}

	/**
	 * Method to switch Tom's state
	 * @param {State} state - The new state to switch to
	 */
	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	/**
	 * Method to update Tom's state and position
	 * @param {number} deltaTime - The time since the last update
	 * @param {Controller} controller - The controller object
	 */
	update(deltaTime, controller) {
		super.update(deltaTime, this.gameMap);
		// Check for landing on a PowerUp tile
		const currentTile = this.getCurrentTile(this.gameMap);
		const powerUpTileLocation = this.gameMap.quantize(
			this.gameMap.getPowerUpTileLocation()
		);

		if (
			powerUpTileLocation &&
			currentTile.x === powerUpTileLocation.x &&
			currentTile.z === powerUpTileLocation.z &&
			!this.gameMap.isPowerUPTileActive() &&
			!this.isPowerActivated
		) {
			this.powerUP();
			setTimeout(() => {
				this.removePowerUp();
			}, 6000);
		}

		this.state.updateState(this, controller);
	}

	/**
	 * Method to get Tom's current tile
	 * @returns {TileNode} - The current tile node
	 */
	getCurrentTile() {
		return this.gameMap.quantize(this.location);
	}

	/**
	 * Method to set Tom's speed
	 * @param {number} topSpeed - The new top speed
	 */
	setSpeed(topSpeed) {
		this.topSpeed = topSpeed;
	}

	/**
	 * Method to check if Tom has moved significantly
	 * @returns {boolean} - Whether Tom has moved significantly
	 */
	movedSignificantly() {
		return this.hasMovedSignificantly;
	}

	/**
	 * Method to activate Tom's power up
	 */
	powerUP() {
		console.log("Cat PowerUp activated");
		this.gameMap.activatePowerUPTile();
		this.isPowerActivated = true;
		this.setSpeed(10);
	}

	/**
	 * Method to deactivate Tom's power up
	 */
	removePowerUp() {
		this.isPowerActivated = false;
		console.log("Cat PowerUp deactivated");
		this.setSpeed(5);
		this.gameMap.resetPowerUPTile();
	}
}

/**
 * Class to represent the idle state of the Tom character
 */
export class IdleState extends State {
	/**
	 * Method to enter the idle state
	 * @param {Tom} player - The Tom character
	 */
	enterState(player) {
		player.velocity.x = 0;
		player.velocity.z = 0;
	}

	/**
	 * Method to update the idle state
	 * @param {Tom} player - The Tom character
	 * @param {Controller} controller - The controller object
	 */
	updateState(player, controller) {
		if (controller.moving()) {
			player.switchState(new MovingState());
		}
	}
}
/**
 * Class to represent the moving state of the Tom character
 */
export class MovingState extends State {
	/**
	 * Method to enter the moving state
	 */
	enterState() {}

	/**
	 * Method to update the moving state
	 * @param {Tom} player - The Tom character
	 * @param {Controller} controller - The controller object
	 */
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
