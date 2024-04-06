import * as THREE from "three";

export class State {
	// Creating an abstract class in JS
	// Ensuring enterState and updateState are implemented
	constructor() {
		if (this.constructor == State) {
			throw new Error("Class is of abstract type and cannot be instantiated");
		}

		if (this.enterState == undefined) {
			throw new Error("enterState method must be implemented");
		}

		if (this.updateState == undefined) {
			throw new Error("updateState method must be implemented");
		}
	}
}

export class GoToPowerUP extends State {
	enterState(character) {
		if (character.location !== undefined) {
			const currentTile = character.gameMap.getCurrentTile(character.location);
			const powerUpTile = character.gameMap.getNode(
				character.gameMap.getPowerUpTileLocation().x,
				character.gameMap.getPowerUpTileLocation().z
			);
			if (currentTile !== undefined && powerUpTile !== undefined) {
				const targetPosition = character.gameMap.localize(powerUpTile);
				if (currentTile.x != powerUpTile.x || currentTile.z != powerUpTile.z) {
					const steer = character.seek(targetPosition);
					character.applyForce(steer);
				} else if (
					currentTile.x === powerUpTile.x &&
					currentTile.z === powerUpTile.z
				) {
					character.state = new PowerUP();
				}
			}
		}
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class AvoidTom extends State {
	enterState(character) {
		// Determine if the character needs a new path to avoid Tom
		if (character.needsNewPath(character.tom)) {
			// Check if the character is moving towards Tom and attempt to escape
			if (character.isMovingTowards(character.tom)) {
				let escapeDirection = character.calculateEscapeDirection(character.tom);
				character.attemptEscape(
					character.gameMap,
					escapeDirection,
					character.tom
				);
			} else {
				// If not moving towards Tom, choose a random direction to move
				character.chooseRandomDirection(character.gameMap, 20, character.tom);
			}
		}

		// Follow the existing path or move randomly if no path available
		if (character.path && character.path.length > 0) {
			character.followPath(character.gameMap);
		} else {
			// If there's no path, try moving in any direction
			character.moveAny(character.gameMap, character.tom);
		}
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class PowerUP extends State {
	enterState(character) {
		switch (character.constructor.name) {
			case "Tom":
				character.state = new CatPowerUp();
				break;
			case "Mouse":
				character.state = new MousePowerUp();
				break;
			case "Dog":
				character.state = new DogPowerUp();
				break;
			default:
				break;
		}
	}
	updateState(character) {
		this.enterState(character);
	}
}

export class DogPowerUp extends State {
	enterState(character) {
		character.gameMap.activatePowerUPTile();
		character.setSpeed(8);
		let targetNode = character.gameMap.quantize(character.getTomLocation());
		if (!targetNode) {
			console.error("Target node for Tom's location is not valid.");
			return;
		}
		let path = character.gameMap.astar(
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
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class CatPowerUp extends State {
	enterState(character) {
		console.log("Tom is in CatPowerUp state");
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class MousePowerUp extends State {
	enterState(character) {
		character.gameMap.activatePowerUPTile();
		character.disappear();
		setTimeout(() => {
			character.state = new RemoveMousePowerUp();
		}, 6000);
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class RemoveMousePowerUp extends State {
	enterState(character) {
		character.appear();
		character.gameMap.resetPowerUPTile();
	}

	updateState(character) {
		this.enterState(character);
	}
}
