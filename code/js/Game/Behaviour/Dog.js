import { Character } from "./Character.js";
import { State } from "./State.js";
import * as THREE from "three";
import { PathFinding } from "../../Util/PathFinding.js";

export class Dog extends Character {
	constructor(color, gameMap, tom) {
		super(color, gameMap);
		this.topSpeed = 4;
		this.pathFinding = new PathFinding(gameMap);
		this.state = new GoToPowerUP();
		this.state.enterState(this);
		this.tom = tom;
		this.isPowerActivated = false;
	}

	/**
	 * Method to switch the state
	 * @param {State} state - The state to switch to
	 */
	switchState(state) {
		this.state = state;
		this.state.enterState(this); // Pass gameMap when entering the new state
	}

	/**
	 * Method to update the bot
	 * @param {*} deltaTime - The time since the last update
	 */
	update(deltaTime) {
		// Call the base class update (Character's update logic)
		super.update(deltaTime, this.gameMap);

		// Existing state update logic...
		this.state.updateState(this);
	}

	setSpeed(topSpeed) {
		this.topSpeed = topSpeed;
	}

	getTomLocation() {
		return this.tom.location;
	}
}

export class GoToPowerUP extends State {
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
				const targetPosition = character.gameMap.localize(powerUpTile);
				if (currentTile.x != powerUpTile.x || currentTile.z != powerUpTile.z) {
					const steer = character.seek(targetPosition);
					character.applyForce(steer);
				} else if (
					currentTile.x === powerUpTile.x &&
					currentTile.z === powerUpTile.z &&
					!character.gameMap.isPowerUPTileActive()
				) {
					character.state = new DogPowerUp();
				}
			}
		}
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class DogPowerUp extends State {
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

	updateState(character) {
		this.enterState(character);
	}
}

export class RemoveDogPowerUp extends State {
	enterState(character) {
		character.gameMap.resetPowerUPTile();
		character.setSpeed(4);
		character.state = new GoToPowerUP();
		character.isPowerActivated = false;
	}

	updateState(character) {
		this.enterState(character);
	}
}
