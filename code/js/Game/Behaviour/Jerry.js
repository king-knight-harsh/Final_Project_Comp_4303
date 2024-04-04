import * as THREE from "three";
import { Character } from "./Character.js";

export class Mouse extends Character {
	constructor(mColor) {
		super(mColor);
		this.path = [];
		this.currentTargetIndex = 0;
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

		if (this.path && this.path.length > 0) {
			this.followPath(deltaTime, gameMap);
		} else {
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
		let safeDistance = 20;
		let escapeTargetPosition = new THREE.Vector3().addVectors(
			this.location,
			direction.multiplyScalar(safeDistance)
		);
		let escapeTargetTile = gameMap.quantize(escapeTargetPosition);

		if (escapeTargetTile && gameMap.isTileWalkable(escapeTargetTile)) {
			this.path = gameMap.astar(this.getCurrentTile(gameMap), escapeTargetTile);
			this.currentTargetIndex = 0;
		} else {
			this.chooseRandomDirection(gameMap, safeDistance, player);
		}
	}

	chooseRandomDirection(gameMap, safeDistance, player) {
		let attempts = 0;
		let found = false;
		while (attempts < 10 && !found) {
			let randomDirection = new THREE.Vector3(
				Math.random() * 2 - 1,
				0,
				Math.random() * 2 - 1
			).normalize();
			let potentialTargetPosition = new THREE.Vector3().addVectors(
				this.location,
				randomDirection.multiplyScalar(safeDistance)
			);
			let potentialTargetTile = gameMap.quantize(potentialTargetPosition);
			let distanceFromTom = potentialTargetPosition.distanceTo(player.location);

			if (
				distanceFromTom > safeDistance &&
				potentialTargetTile &&
				gameMap.isTileWalkable(potentialTargetTile)
			) {
				this.path = gameMap.astar(
					this.getCurrentTile(gameMap),
					potentialTargetTile
				);
				this.currentTargetIndex = 0;
				found = true;
			}
			attempts++;
		}
		if (!found) {
			console.warn(
				"Jerry couldn't find a safe path away from Tom. Staying put."
			);
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
