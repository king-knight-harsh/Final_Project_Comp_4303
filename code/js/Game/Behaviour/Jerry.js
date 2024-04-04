import * as THREE from "three";
import { Character } from "./Character.js";

export class Mouse extends Character {
	constructor(mColor) {
		super(mColor);
		this.path = [];
		this.currentTargetIndex = 0;
		this.topSpeed = 10;
	}

	update(deltaTime, gameMap, player) {
		if (this.needsNewPath(player)) {
			let movingTowardsJerry = this.isMovingTowards(player);

			if (movingTowardsJerry) {
				let escapeDirection = this.calculateEscapeDirection(player);
				this.attemptEscape(gameMap, escapeDirection, player);
			} else {
				this.chooseRandomDirection(gameMap, 20, player);
			}
		}

		// Existing path following logic remains unchanged
		if (this.path && this.path.length > 0) {
			this.followPath(deltaTime, gameMap);
		} else {
			// Prevent Jerry from moving towards an idle Tom
			this.chooseRandomDirection(gameMap, 20, player);
		}

		super.update(deltaTime, gameMap);
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

	followPath(deltaTime, gameMap) {
		if (this.currentTargetIndex >= this.path.length) return;

		let currentTarget = gameMap.localize(this.path[this.currentTargetIndex]);
		let direction = currentTarget.clone().sub(this.location).normalize();
		this.applyForce(direction.multiplyScalar(this.topSpeed));

		if (this.location.distanceTo(currentTarget) < gameMap.tileSize * 0.5) {
			this.currentTargetIndex++;
		}
	}

	needsNewPath(player) {
		return (
			this.currentTargetIndex >= (this.path?.length || 0) ||
			player.movedSignificantly()
		);
	}

	getCurrentTile(gameMap) {
		return gameMap.quantize(this.location);
	}
}
