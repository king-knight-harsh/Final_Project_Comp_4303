import { Character } from "./Character.js";
import { State } from "./State.js";
import { PathFinding } from "../../Util/PathFinding.js";

/**
 * Class representing a Dog character in the game
 */
export class Dog extends Character {
	/**
	 * Constructor for the Dog class
	 * @param {THREE.Color} color - Color of the dog character
	 * @param {GameMap} gameMap - The game map object
	 * @param {Character} tom - The Tom character object
	 */
	constructor(color, gameMap, tom) {
		super(color, gameMap);

		this.pathFinding = new PathFinding(gameMap);
		this.topSpeed = 4;
		this.tom = tom;
		this.isPowerActivated = false;
		this.switchState(new GoToPowerUP());
	}

	/**
	 * Method to update the Dog character
	 * @param {number} deltaTime - Time interval between updates
	 */
	update(deltaTime) {
		// Call the base class update (Character's update logic)
		super.update(deltaTime, this.gameMap);
		if (this.state) {
			this.state.updateState(this);
		}
		// Update the Dog's state
		this.state.updateState(this);
	}

	/**
	 * Method to set the top speed of the Dog character
	 * @param {number} topSpeed - The new top speed value
	 */
	setSpeed(topSpeed) {
		this.topSpeed = topSpeed;
	}

	/**
	 * Method to get the location of the Tom character
	 * @returns {THREE.Vector3} - The location of the Tom character
	 */
	getTomLocation() {
		return this.tom.location;
	}

	/**
	 * Method to switch the state of the mouse character
	 * @param {State} state - The new state to switch to
	 */
	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	/**
	 * Function to catch Tom using aStar pathfinding algorithm
	 */
	catchTom() {
		let targetNode = this.gameMap.quantize(this.getTomLocation());
		if (!targetNode) {
			console.error("Target node for Tom's location is not valid.");
			return;
		}
		let path = this.pathFinding.aStar(
			this.gameMap.quantize(this.location),
			targetNode
		);
		if (path && path.length > 1) {
			// Ensure path[1] exists
			let targetPosition = this.gameMap.localize(path[1]);
			if (targetPosition) {
				let steer = this.seek(targetPosition);
				this.applyForce(steer);
			} else {
				console.error("Invalid target position derived from path.");
			}
		}
	}

	findPowerUp() {
		if (this.location !== undefined) {
			const currentTile = this.getCurrentTile();
			const powerUpTile = this.gameMap.quantize(
				this.gameMap.getPowerUpTileLocation()
			);
			let path = this.pathFinding.aStar(
				this.gameMap.quantize(this.location),
				powerUpTile
			);
			if (powerUpTile && currentTile) {
				if (
					currentTile.x === powerUpTile.x &&
					currentTile.z === powerUpTile.z &&
					!this.gameMap.isPowerUPTileActive() &&
					!this.isPowerActivated
				) {
					this.switchState(new DogPowerUp());
				} else if (path && path.length > 1) {
					// Ensure path[1] exists
					let targetPosition = this.gameMap.localize(path[1]);
					if (targetPosition) {
						let steer = this.seek(targetPosition);
						this.applyForce(steer);
					} else {
						console.error("Invalid target position derived from path.");
					}
				}
			}
		}
	}
}

/**
 * Class representing the GoToPowerUP state
 */
export class GoToPowerUP extends State {
	/**
	 * Method to enter the GoToPowerUP state
	 * @param {Dog} character - The Dog character
	 */
	enterState(character) {
		if (character.gameMap.isPowerUPTileActive()) {
			character.catchTom();
		} else if (
			!character.gameMap.isPowerUPTileActive() &&
			!character.isPowerActivated
		) {
			character.findPowerUp();
		}
	}

	/**
	 * Method to update the GoToPowerUP state
	 * @param {Dog} character - The Dog character
	 */
	updateState(character) {
		this.enterState(character);
	}
}

/**
 * Class representing the DogPowerUp state
 */
export class DogPowerUp extends State {
	/**
	 * Method to enter the DogPowerUp state
	 * @param {Dog} character - The Dog character
	 */
	enterState(character) {
		character.isPowerActivated = true;
		console.log("Dog PowerUp Activated!");
		character.gameMap.activatePowerUPTile();
		character.setSpeed(8);

		setTimeout(() => {
			character.switchState(new RemoveDogPowerUp());
		}, 10000);
	}

	/**
	 * Method to update the DogPowerUp state
	 * @param {Dog} character - The Dog character
	 */
	updateState(character) {
		character.catchTom();
	}
}

/**
 * Class representing the RemoveDogPowerUp state
 */
export class RemoveDogPowerUp extends State {
	/**
	 * Method to enter the RemoveDogPowerUp state
	 * @param {Dog} character - The Dog character
	 */
	enterState(character) {
		character.isPowerActivated = false;
		console.log("Dog PowerUp Deactivated!");
		character.gameMap.resetPowerUPTile();
		character.setSpeed(3);
		character.switchState(new GoToPowerUP());
	}

	/**
	 * Method to update the RemoveDogPowerUp state
	 * @param {Dog} character - The Dog character
	 */
	updateState() {}
}
