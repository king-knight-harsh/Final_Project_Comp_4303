import * as THREE from "three";
import { Character } from "./Character.js";
import { State } from "./State.js";
import { PathFinding } from "../../Util/PathFinding.js";
import { VectorUtil } from "../../Util/VectorUtil.js";
export class Mouse extends Character {
	constructor(mColor, gameMap, tom) {
		super(mColor, gameMap);
		this.pathFinding = new PathFinding(gameMap);
		this.path = [];
		this.currentTargetIndex = 0;
		this.topSpeed = 10;
		this.tom = tom;
		this.isPowerActivated = false;
		this.state = new AvoidTom();
		this.state.enterState(this);
	}

	update(deltaTime) {
		// Call the base class update (Character's update logic)
		super.update(deltaTime, this.gameMap);

		// Existing state update logic...
		this.state.updateState(this);
	}

	switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

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

	calculateEscapeDirection(player) {
		return VectorUtil.sub(this.location, player.location).normalize();
	}

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
			!character.gameMap.isPowerUPTileActive()
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

		// Determine if the character needs a new path to avoid Tom
	}

	updateState(character) {
		this.enterState(character);
	}
}

export class MousePowerUp extends State {
	enterState(character) {
		console.log("Mouse has activated the power-up!");
		character.disappear();
		character.gameMap.activatePowerUPTile();
		character.isPowerActivated = true;
		setTimeout(() => {
			character.switchState(new RemoveMousePowerUp());
		}, 6000);
	}

	updateState(character) {}
}

export class RemoveMousePowerUp extends State {
	enterState(character) {
		console.log("Mouse has power-up is exhausted!");
		character.respawnAtRandomLocation();
		character.appear();
		character.gameMap.resetPowerUPTile();
		character.isPowerActivated = false;
		character.switchState(new AvoidTom());
	}

	updateState(character) {}
}
