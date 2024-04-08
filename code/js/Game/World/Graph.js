import { HaltonSequence } from "../../Util/HaltonSequence.js";
import { TileNode } from "./TileNode.js";

/**
 * Class representing a graph of nodes
 */
export class Graph {
	/**
	 * Constructor for the Graph class
	 * @param {number} tileSize - The size of each tile
	 * @param {number} cols - The number of columns in the graph
	 * @param {number} rows - The number of rows in the graph
	 */
	constructor(tileSize, cols, rows) {
		// Initialize the list of nodes in the graph
		this.nodes = [];
		// Initialize the size of each tile
		this.tileSize = tileSize;
		// Initialize the number of columns in the graph
		this.cols = cols;
		// Initialize the number of rows in the graph
		this.rows = rows;
		// Initialize the Halton sequence for generating random positions
		this.haltonSequence = new HaltonSequence();
	}

	/**
	 * Method to initialize the graph with obstacles and connections between nodes
	 * @param {number} numberOfObstacles - The number of obstacles to generate
	 */
	initGraph(numberOfObstacles) {
		// Empty the list of nodes
		this.nodes = [];

		// Create nodes for the graph
		for (let j = 0; j < this.rows; j++) {
			for (let i = 0; i < this.cols; i++) {
				let id = j * this.cols + i;
				let node = new TileNode(id, i, j, TileNode.Type.Ground);
				this.nodes.push(node);
			}
		}

		// Place obstacles in the graph
		this.placeObstacles(numberOfObstacles);

		// Place a power-up in the graph
		this.placePowerUp();

		// Establish connections between nodes
		this.establishConnections();
	}

	/**
	 * Method to randomly place obstacles in the graph
	 * @param {number} numberOfObstacles - The number of obstacles to place
	 */
	placeObstacles(numberOfObstacles) {
		// Initialize the number of obstacles placed
		let placed = 0;
		// Halton sequence starts at index 1
		let index = 1;
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

	/**
	 * Method to place a power-up in the graph
	 */
	placePowerUp() {
		let placed = false;
		while (!placed) {
			let index = Math.floor(Math.random() * this.nodes.length);
			if (!this.nodes[index].isObstacle()) {
				this.nodes[index].type = TileNode.Type.PowerUp;
				placed = true;
			}
		}
	}

	/**
	 * Method to establish connections between nodes
	 */
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

	/**
	 * Method to retrieve a node from the graph
	 * @param {number} x - The x coordinate of the node
	 * @param {number} z - The z coordinate of the node
	 * @returns {TileNode} - The node from the graph
	 */
	getNode(x, z) {
		if (x < 0 || x >= this.cols || z < 0 || z >= this.rows) return null;
		return this.nodes[z * this.cols + x];
	}

	/**
	 * Method to get a random empty tile from the graph
	 * @returns {TileNode} - A random empty tile
	 */
	getRandomEmptyTile() {
		let index = Math.floor(Math.random() * this.nodes.length);
		while (
			this.nodes[index].type == TileNode.Type.Obstacle ||
			this.nodes[index].type == TileNode.Type.PowerUp
		) {
			index = Math.floor(Math.random() * this.nodes.length);
		}
		return this.nodes[index];
	}
}
