import { TileNode } from "./TileNode.js";
import * as THREE from "three";

export class Graph {
	// Constructor for our Graph class
	constructor(tileSize, cols, rows) {
		// node array to hold our graph
		this.nodes = [];

		this.tileSize = tileSize;
		this.cols = cols;
		this.rows = rows;

		this.obstacles = [];
	}

	length() {
		return this.nodes.length;
	}

	// Initialize our game graph
	initGraph() {
		// Create a new tile node
		// for each index in the grid
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				let type = TileNode.Type.Ground;
				let node = new TileNode(this.nodes.length, i, j, type);

				let obs = Math.random();
				if (obs < 0.3) {
					node.type = TileNode.Type.Obstacle;
					this.obstacles.push(node);
				}

				this.nodes.push(node);
			}
		}

		let maxAttempts = 100;
		let attempts = 0;
		let powerUpPlaced = false;

		while (!powerUpPlaced && attempts < maxAttempts) {
			let randomX = Math.floor(Math.random() * this.cols);
			let randomZ = Math.floor(Math.random() * this.rows);
			let powerUpIndex = randomZ * this.cols + randomX;

			// Ensure the selected tile is initially Ground and not an Obstacle
			if (this.nodes[powerUpIndex].type === TileNode.Type.Ground) {
				this.nodes[powerUpIndex].type = TileNode.Type.PowerUp; // Set the random node to PowerUp
				powerUpPlaced = true;
			} else {
				attempts++;
			}
		}

		if (!powerUpPlaced) {
			console.error(
				"Failed to place PowerUp after " +
					maxAttempts +
					" attempts. Consider adjusting map layout or obstacle density."
			);
		}
		

		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				// The index of our current node
				let index = j * this.cols + i;
				let current = this.nodes[index];
				let temp = false;
				if (current.type == TileNode.Type.Obstacle) {
					if (i > 0) {
						// CREATE A WEST EDGE
						let west = this.nodes[index - 1];
						if (west.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;
						}
					}
		
					if (i < this.cols - 1) {
						// CREATE AN EAST EDGE
						let east = this.nodes[index + 1];
						if (east.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;
						}
					}
		
					if (j > 0) {
						// CREATE A NORTH EDGE
						let north = this.nodes[index - this.cols];
						if (north.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;

						}
					}
		
					if (j < this.rows - 1) {
						// CREATE A SOUTH EDGE
						let south = this.nodes[index + this.cols];
						if (south.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;
						}
					}
		
					// Check diagonals
					if (i > 0 && j > 0) {
						// Northwest
						let nw = this.nodes[index - this.cols - 1];
						if (nw.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;
						}
					}
		
					if (i < this.cols - 1 && j > 0) {
						// Northeast
						let ne = this.nodes[index - this.cols + 1];
						if (ne.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;
						}
					}
		
					if (i > 0 && j < this.rows - 1) {
						// Southwest
						let sw = this.nodes[index + this.cols - 1];
						if (sw.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;
						}
					}
		
					if (i < this.cols - 1 && j < this.rows - 1) {
						// Southeast
						let se = this.nodes[index + this.cols + 1];
						if (se.type === TileNode.Type.Obstacle) {
							this.nodes[index].type = TileNode.Type.Ground;
							temp = true;
						}
					}

				}
				if (temp)
				{
					this.obstacles.splice(this.obstacles.indexOf(current), 1);
				}
			}
		}
		
		// Create west, east, north, south
		// edges for each node in our graph
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				// The index of our current node
				let index = j * this.cols + i;
				let current = this.nodes[index];

				if (current.type == TileNode.Type.Ground) {
					if (i > 0) {
						// CREATE A WEST EDGE
						let west = this.nodes[index - 1];
						current.tryAddEdge(west, this.tileSize);
					}

					if (i < this.cols - 1) {
						// CREATE AN EAST EDGE
						let east = this.nodes[index + 1];
						current.tryAddEdge(east, this.tileSize);
					}

					if (j > 0) {
						// CREATE A NORTH EDGE
						let north = this.nodes[index - this.cols];
						current.tryAddEdge(north, this.tileSize);
					}

					if (j < this.rows - 1) {
						// CREATE A SOUTH EDGE
						let south = this.nodes[index + this.cols];
						current.tryAddEdge(south, this.tileSize);
					}
				}
			}
		}
	}

	getNode(x, z) {
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
