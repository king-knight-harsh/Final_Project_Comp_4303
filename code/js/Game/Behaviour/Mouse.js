import * as THREE from "three";
import { Character } from "./Character.js";
import { State } from "./State.js";
import { PathFinding } from "../../Util/PathFinding.js";
import { VectorUtil } from "../../Util/VectorUtil.js";

export class Mouse extends Character {
	/**
	 * Constructor for the Mouse character
	 * @param {THREE.Color} mColor - Color of the mouse
	 * @param {GameMap} gameMap - The game map object
	 * @param {Character} tom - The Tom character object
	 */
	constructor(mColor, gameMap, tom) {
		super(mColor, gameMap);
		this.pathFinding = new PathFinding(gameMap);
		this.path = [];
		this.currentTargetIndex = 0;
		this.topSpeed = 10;
		this.tom = tom;
		this.isPowerActivated = false;
		this.switchState(new AvoidTom());
	}

	/**
	 * Method to update the state of the mouse character
	 * @param {number} deltaTime - Time since the last update
	 */
	update(deltaTime) {
		super.update(deltaTime, this.gameMap);

		let steer = this.avoidCollision(this.gameMap.getObstacles());
		if (steer.length != 0) {
			this.applyForce(steer);
		}
		this.state.updateState(this);
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
	 * Method to check if the mouse character is moving towards a player
	 * @param {Character} player - The player character
	 * @returns {boolean} - True if moving towards the player, otherwise false
	 */
	isMovingTowards(player) {
		let tomMovementDirection = VectorUtil.sub(
			player.location,
			player.previousPosition
		).normalize();
		let jerryToTomDirection = VectorUtil.sub(
			player.location,
			this.location
		).normalize();
		return VectorUtil.dot(tomMovementDirection, jerryToTomDirection) > 0.5;
	}

	/**
	 * Method to calculate the escape direction from a player
	 * @param {Character} player - The player character
	 * @returns {THREE.Vector3} - The escape direction vector
	 */
	calculateEscapeDirection(player) {
		return VectorUtil.sub(this.location, player.location).normalize();
	}

	/**
	 * Method to attempt escaping from a player in a given direction
	 * @param {THREE.Vector3} direction - The escape direction vector
	 * @param {Character} player - The player character
	 */
	attemptEscape(direction, player) {
		let safeRadius = 6;
		let escapeTargetPosition = VectorUtil.add(
			this.location,
			VectorUtil.multiplyScalar(direction, safeRadius)
		);
		let escapeTargetTile = this.gameMap.quantize(escapeTargetPosition);

		if (escapeTargetTile && this.gameMap.isTileWalkable(escapeTargetTile)) {
			this.path = this.pathFinding.aStar(
				this.getCurrentTile(),
				escapeTargetTile
			);
			this.currentTargetIndex = 0;
		} else {
			this.chooseRandomDirection(safeRadius, player);
		}
	}

	/**
	 * Method to choose a random direction for escape
	 * @param {number} safeRadius - The safe radius for escape
	 * @param {Character} player - The player character
	 */
	chooseRandomDirection(safeRadius, player) {
		let maxAttempts = 20;
		let found = false;
		let furthestDistance = 0;
		let bestTargetTile = null;

		for (let i = 0; i < maxAttempts; i++) {
			let randomDirection = new THREE.Vector3(
				Math.random() * 2 - 1,
				0,
				Math.random() * 2 - 1
			).normalize();
			let potentialTargetPosition = new THREE.Vector3().addVectors(
				this.location,
				randomDirection.multiplyScalar(safeRadius)
			);
			let distanceFromTom = potentialTargetPosition.distanceTo(player.location);

			if (distanceFromTom > furthestDistance) {
				let potentialTargetTile = this.gameMap.quantize(
					potentialTargetPosition
				);
				if (
					potentialTargetTile &&
					this.gameMap.isTileWalkable(potentialTargetTile)
				) {
					furthestDistance = distanceFromTom;
					bestTargetTile = potentialTargetTile;
					found = true;
				}
			}
		}

		if (found && bestTargetTile) {
			this.path = this.pathFinding.aStar(this.getCurrentTile(), bestTargetTile);
			this.currentTargetIndex = 0;
		} else {
			console.warn(
				"Jerry couldn't find a safer path away from Tom. Trying any movement."
			);
			// As a last resort, try moving to any adjacent walkable tile.
			this.moveAny(player);
		}
	}

	/**
	 * Method to move to any available tile
	 * @param {Character} player - The player character
	 */
	moveAny(player) {
		let bestDistance = 0;
		let bestTile = null;
		let currentTile = this.getCurrentTile();

		// Scan in a wider range around Jerry for a potential move
		for (let dx = -1; dx <= 1; dx++) {
			for (let dz = -1; dz <= 1; dz++) {
				if (dx === 0 && dz === 0) continue; // Skip the current tile

				let checkX = currentTile.x + dx;
				let checkZ = currentTile.z + dz;
				let potentialTile = this.gameMap.graph.getNode(checkX, checkZ);
				if (potentialTile && this.gameMap.isTileWalkable(potentialTile)) {
					let potentialPosition = this.gameMap.localize(potentialTile);
					let distanceFromTom = potentialPosition.distanceTo(player.location);
					if (distanceFromTom > bestDistance) {
						bestDistance = distanceFromTom;
						bestTile = potentialTile;
					}
				}
			}
		}

		if (bestTile) {
			this.path = this.pathFinding.aStar(currentTile, bestTile);
			this.currentTargetIndex = 0;
		} else {
			console.warn("Jerry is trapped and cannot move to any adjacent tile.");
			this.path = [];
		}
	}

	/**
	 * Method to follow the precalculated path
	 */
	followPath() {
		if (this.currentTargetIndex < this.path.length) {
			let currentTarget = this.gameMap.localize(
				this.path[this.currentTargetIndex]
			);
			let direction = VectorUtil.sub(currentTarget, this.location).normalize();
			this.applyForce(VectorUtil.multiplyScalar(direction, this.topSpeed));

			if (
				VectorUtil.distance(this.location, currentTarget) <
				this.gameMap.tileSize * 0.5
			) {
				this.currentTargetIndex++;
			}
		}
	}

	/**
	 * Method to check if a new path is needed
	 * @param {Character} player - The player character
	 * @returns {boolean} - True if a new path is needed, otherwise false
	 */
	needsNewPath(player) {
		return (
			this.currentTargetIndex >= (this.path?.length || 0) ||
			player.movedSignificantly()
		);
	}

	/**
	 * Method to set the top speed of the mouse character
	 * @param {number} topSpeed - The top speed value
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
 * Class representing the AvoidTom state
 */
export class AvoidTom extends State {
	enterState() {}

	/**
	 * Method to update the AvoidTom state
	 * @param {Mouse} character - The mouse character
	 */
	updateState(character) {
		// First, check if the character is on a power-up tile
		const currentTile = character.getCurrentTile(character.location);
		const powerUpTile = character.gameMap.quantize(
			character.gameMap.getPowerUpTileLocation()
		);
		// If the character is on the power-up tile, switch to the PowerUP state
		if (
			currentTile &&
			powerUpTile &&
			currentTile.x === powerUpTile.x &&
			currentTile.z === powerUpTile.z &&
			!character.gameMap.isPowerUPTileActive() &&
			!character.isPowerActivated
		) {
			character.switchState(new MousePowerUp());
		}
		if (character.needsNewPath(character.tom)) {
			// Check if the character is moving towards Tom and attempt to escape
			if (character.isMovingTowards(character.tom)) {
				let escapeDirection = character.calculateEscapeDirection(character.tom);
				character.attemptEscape(escapeDirection, character.tom);
			} else {
				// If not moving towards Tom, choose a random direction to move
				character.chooseRandomDirection(20, character.tom);
			}
		}

		// Follow the existing path or move randomly if no path available
		if (character.path && character.path.length > 0) {
			character.followPath();
		} else {
			// If there's no path, try moving in any direction
			character.moveAny(character.tom);
		}
	}
}

/**
 * Class representing the MousePowerUp state
 */
export class MousePowerUp extends State {
	/**
	 * Method to enter the MousePowerUp state
	 * @param {Mouse} character - The mouse character
	 */
	enterState(character) {
		character.isPowerActivated = true;
		console.log("Mouse has activated the power-up!");
		character.disappear();
		character.gameMap.activatePowerUPTile();
		setTimeout(() => {
			character.switchState(new RemoveMousePowerUp());
		}, 6000);
	}

	/**
	 * Method to update the MousePowerUp state
	 */
	updateState() {}
}

/**
 * Class representing the RemoveMousePowerUp state
 */
export class RemoveMousePowerUp extends State {
	/**
	 * Method to enter the RemoveMousePowerUp state
	 * @param {Mouse} character - The mouse character
	 */
	enterState(character) {
		character.isPowerActivated = false;
		console.log("Mouse PowerUp Deactivated!");
		character.respawnAtRandomLocation();
		character.appear();
		character.gameMap.resetPowerUPTile();
		character.switchState(new AvoidTom());
	}

	/**
	 * Method to update the RemoveMousePowerUp state
	 */
	updateState() {}
}
