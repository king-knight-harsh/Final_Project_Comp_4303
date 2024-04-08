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
		this.topSpeed = 3;
		this.pathFinding = new PathFinding(gameMap);
		this.state = new GoToPowerUP();
		this.state.enterState(this);
		this.tom = tom;
		this.isPowerActivated = false;
	}

	/**
	 * Method to update the Dog character
	 * @param {number} deltaTime - Time interval between updates
	 */
	update(deltaTime) {
		// Call the base class update (Character's update logic)
		super.update(deltaTime, this.gameMap);

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
		if (character.location !== undefined) {
			const currentTile = character.getCurrentTile();
			const powerUpTile = character.gameMap.quantize(
				character.gameMap.getPowerUpTileLocation()
			);
			if (
				currentTile !== undefined &&
				powerUpTile !== undefined &&
				powerUpTile &&
				currentTile
			) {
				let path = character.pathFinding.aStar(
					character.gameMap.quantize(character.location),
					powerUpTile
				);
				if (
					currentTile.x === powerUpTile.x &&
					currentTile.z === powerUpTile.z &&
					!character.gameMap.isPowerUPTileActive()
				) {
					character.state = new DogPowerUp();
				} else if (path && path.length > 1) {
					// Ensure path[1] exists
					let targetPosition = character.gameMap.localize(path[1]);
					if (targetPosition) {
						let steer = character.seek(targetPosition);
						character.applyForce(steer);
					} else {
						console.error("Invalid target position derived from path.");
					}
				}
			}
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
		character.gameMap.activatePowerUPTile();
		character.setSpeed(8);
		let targetNode = character.gameMap.quantize(character.getTomLocation());
		if (!targetNode) {
			console.error("Target node for Tom's location is not valid.");
			return;
		}
		let path = character.pathFinding.aStar(
			character.gameMap.quantize(character.location),
			targetNode
		);
		if (path && path.length > 1) {
			// Ensure path[1] exists
			let targetPosition = character.gameMap.localize(path[1]);
			if (targetPosition) {
				let steer = character.seek(targetPosition);
				character.applyForce(steer);
			} else {
				console.error("Invalid target position derived from path.");
			}
		}

		setTimeout(() => {
			character.state = new RemoveDogPowerUp();
		}, 10000);
	}

	/**
	 * Method to update the DogPowerUp state
	 * @param {Dog} character - The Dog character
	 */
	updateState(character) {
		this.enterState(character);
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
		character.gameMap.resetPowerUPTile();
		character.setSpeed(3);
		character.state = new GoToPowerUP();
		character.isPowerActivated = false;
	}

	/**
	 * Method to update the RemoveDogPowerUp state
	 * @param {Dog} character - The Dog character
	 */
	updateState(character) {
		this.enterState(character);
	}
}
