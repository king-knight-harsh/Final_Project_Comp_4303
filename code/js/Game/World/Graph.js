import { HaltonSequence } from "../../Util/HaltonSequence.js";
import { TileNode } from "./TileNode.js";
import * as THREE from "three";

export class Graph {
	// Constructor for our Graph class
	constructor(tileSize, cols, rows) {
		this.nodes = [];
		this.tileSize = tileSize;
		this.cols = cols;
		this.rows = rows;
		this.obstacles = [];
		this.powerUpTile = null;
		this.haltonSequence = new HaltonSequence();
	}

	initGraph(numberOfObstacles) {
		this.nodes = [];
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				let id = j * this.cols + i;
				let node = new TileNode(id, i, j, TileNode.Type.Ground);
				this.nodes.push(node);
			}
		}

		this.placeObstacles(numberOfObstacles);
		this.placePowerUp();
		this.establishConnections();
	}

	placeObstacles(numberOfObstacles) {
		let placed = 0;
		let index = 1; // Halton sequence starts at index 1
		while (placed < numberOfObstacles) {
			// Generate positions using the Halton sequence
			let x = this.haltonSequence.halton(2, index, 0, this.cols);
			let z = this.haltonSequence.halton(3, index, 0, this.rows);
			index++;

			// Quantize the positions to fit the grid
			x = Math.floor(x);
			z = Math.floor(z);

			let nodeIndex = z * this.cols + x;
			if (
				nodeIndex >= 0 &&
				nodeIndex < this.nodes.length &&
				!this.nodes[nodeIndex].isObstacle()
			) {
				this.nodes[nodeIndex].type = TileNode.Type.Obstacle;
				placed++;
			}
		}
	}

	placePowerUp() {
		let placed = false;
		while (!placed) {
			let index = Math.floor(Math.random() * this.nodes.length);
			if (!this.nodes[index].isObstacle()) {
				this.nodes[index].type = TileNode.Type.PowerUp;
				this.powerUpTile = this.nodes[index];
				placed = true;
			}
		}
	}

	establishConnections() {
		this.nodes.forEach((node) => {
			if (!node.isObstacle()) {
				let directions = [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1],
				]; // East, West, South, North
				directions.forEach(([dx, dz]) => {
					let x = node.x + dx,
						z = node.z + dz;
					if (x >= 0 && x < this.cols && z >= 0 && z < this.rows) {
						let neighborIndex = z * this.cols + x;
						let neighbor = this.nodes[neighborIndex];
						if (!neighbor.isObstacle()) {
							node.addEdge(neighbor, 1); // Cost is 1 for simplicity
						}
					}
				});
			}
		});
	}

	getNode(x, z) {
		if (x < 0 || x >= this.cols || z < 0 || z >= this.rows) return null;
		return this.nodes[z * this.cols + x];
	}

	getRandomEmptyTile() {
		let index = Math.floor(Math.random() * this.nodes.length);
		while (this.nodes[index].type == TileNode.Type.Obstacle) {
			index = Math.floor(Math.random() * this.nodes.length);
		}
		return this.nodes[index];
	}
}
