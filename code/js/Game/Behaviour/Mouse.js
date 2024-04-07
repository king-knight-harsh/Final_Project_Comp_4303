import * as THREE from "three";
import { Character } from "./Character.js";
import { State } from "./State.js";

export class Mouse extends Character {
	constructor(mColor, gameMap, tom) {
		super(mColor, gameMap);
		this.path = [];
		this.currentTargetIndex = 0;
		this.topSpeed = 10;
		this.tom = tom;
		this.state = new AvoidTom();
		this.state.enterState(this);
	}

	update(deltaTime, gameMap) {
		super.update(deltaTime, gameMap);
		this.state.updateState(this);
	}

	isMovingTowards(player) {
		let tomMovementDirection = new THREE.Vector3()
			.subVectors(player.location, player.previousPosition)
			.normalize();
		let jerryToTomDirection = new THREE.Vector3()
			.subVectors(player.location, this.location)
			.normalize();
		return tomMovementDirection.dot(jerryToTomDirection) > 0.5;
	}

	calculateEscapeDirection(player) {
		return new THREE.Vector3()
			.subVectors(this.location, player.location)
			.normalize();
	}

	attemptEscape(gameMap, direction, player) {
		let safeRadius = 6;
		let escapeTargetPosition = new THREE.Vector3().addVectors(
			this.location,
			direction.multiplyScalar(safeRadius)
		);
		let escapeTargetTile = gameMap.quantize(escapeTargetPosition);

		if (escapeTargetTile && gameMap.isTileWalkable(escapeTargetTile)) {
			this.path = gameMap.astar(this.getCurrentTile(gameMap), escapeTargetTile);
			this.currentTargetIndex = 0;
		} else {
			this.chooseRandomDirection(gameMap, safeRadius, player);
		}
	}

	chooseRandomDirection(gameMap, safeRadius, player) {
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
				let potentialTargetTile = gameMap.quantize(potentialTargetPosition);
				if (
					potentialTargetTile &&
					gameMap.isTileWalkable(potentialTargetTile)
				) {
					furthestDistance = distanceFromTom;
					bestTargetTile = potentialTargetTile;
					found = true;
				}
			}
		}

		if (found && bestTargetTile) {
			this.path = gameMap.astar(this.getCurrentTile(gameMap), bestTargetTile);
			this.currentTargetIndex = 0;
		} else {
			console.warn(
				"Jerry couldn't find a safer path away from Tom. Trying any movement."
			);
			// As a last resort, try moving to any adjacent walkable tile.
			this.moveAny(gameMap, player);
		}
	}

	moveAny(gameMap, player) {
		let bestDistance = 0;
		let bestTile = null;
		let currentTile = this.getCurrentTile(gameMap);

		// Scan in a wider range around Jerry for a potential move
		for (let dx = -1; dx <= 1; dx++) {
			for (let dz = -1; dz <= 1; dz++) {
				if (dx === 0 && dz === 0) continue; // Skip the current tile

				let checkX = currentTile.x + dx;
				let checkZ = currentTile.z + dz;
				let potentialTile = gameMap.graph.getNode(checkX, checkZ);
				if (potentialTile && gameMap.isTileWalkable(potentialTile)) {
					let potentialPosition = gameMap.localize(potentialTile);
					let distanceFromTom = potentialPosition.distanceTo(player.location);
					if (distanceFromTom > bestDistance) {
						bestDistance = distanceFromTom;
						bestTile = potentialTile;
					}
				}
			}
		}

		if (bestTile) {
			this.path = gameMap.astar(currentTile, bestTile);
			this.currentTargetIndex = 0;
		} else {
			console.warn("Jerry is trapped and cannot move to any adjacent tile.");
			this.path = [];
		}
	}

	followPath() {
		if (this.currentTargetIndex < this.path.length) {
			let currentTarget = this.gameMap.localize(
				this.path[this.currentTargetIndex]
			);
			let direction = currentTarget.clone().sub(this.location).normalize();
			this.applyForce(direction.multiplyScalar(this.topSpeed));

			if (
				this.location.distanceTo(currentTarget) <
				this.gameMap.tileSize * 0.5
			) {
				this.currentTargetIndex++;
			}
		}
	}

	needsNewPath(player) {
		return (
			this.currentTargetIndex >= (this.path?.length || 0) ||
			player.movedSignificantly()
		);
	}

	setSpeed(topSpeed) {
		this.topSpeed = topSpeed;
	}

	getTomLocation() {
		return this.tom.location;
	}
}

export class AvoidTom extends State {
	enterState(character) {
		// First, check if the character is on a power-up tile
		const currentTile = character.gameMap.getCurrentTile(character.location);
		const powerUpTile = character.gameMap.getNode(
			character.gameMap.getPowerUpTileLocation().x,
			character.gameMap.getPowerUpTileLocation().z
		);

		// If the character is on the power-up tile, switch to the PowerUP state
		if (
			currentTile &&
			powerUpTile &&
			currentTile.x === powerUpTile.x &&
			currentTile.z === powerUpTile.z &&
			!character.isPowerActivated
		) {
			character.state = new MousePowerUp();
			return;
		}
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

export class MousePowerUp extends State {
	enterState(character) {
		character.disappear();
		character.gameMap.activatePowerUPTile();
		character.isPowerActivated = true;
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
		character.respawnAtRandomLocation();
		character.appear();
		character.gameMap.resetPowerUPTile();
		character.isPowerActivated = false;
		character.state = new AvoidTom();
	}

	updateState(character) {
		this.enterState(character);
	}
}
