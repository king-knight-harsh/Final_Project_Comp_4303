import { TileNode } from "./TileNode.js";
import * as THREE from "three";
import { MapRenderer } from "./MapRenderer";
import { Graph } from "./Graph";
import { PriorityQueue } from "../../Util/PriorityQueue";
import { VectorUtil } from "../../Util/VectorUtil";
import { Tom } from "../Behaviour/Cat.js";
import { Mouse } from "../Behaviour/Mouse.js";

export class GameMap {
	// Constructor for our GameMap class
	constructor() {
		this.start = new THREE.Vector3(-25, 0, -25);

		this.width = 50;
		this.depth = 50;
		this.powerUpTilesLocation = null;
		// We also need to define a tile size
		// for our tile based map
		this.tileSize = 5;

		// Get our columns and rows based on
		// width, depth and tile size
		this.cols = this.width / this.tileSize;
		this.rows = this.depth / this.tileSize;

		// Create our graph
		// Which is an array of nodes
		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		// Create our map renderer
		this.mapRenderer = new MapRenderer(this.start, this.tileSize, this.cols);

		this.flowfield = new Map();
		this.goal = null;
		this.powerUpTiles = new Map();
	}

	init(scene, numberOfObstacles = 10) {
		this.scene = scene;
		this.graph.initGraph(numberOfObstacles);
		this.powerUpTilesLocation = this.graph.powerUpLocation;
		this.highlight(this.powerUpTilesLocation, 0xffff00);
		this.gameObject = this.mapRenderer.createRendering(this.graph.nodes, scene);
	}

	halton(base, index, start, end) {
		let result = 0;
		let denominator = 1;

		while (index > 0) {
			denominator = denominator * base;
			result = result + (index % base) / denominator;
			index = Math.floor(index / base);
		}
		let output = result * (end - start) + start;
		return output;
	}

	getPowerUpTileLocation() {
		return this.powerUpTilesLocation;
	}

	// Method to get location from a node
	localize(node) {
		if (!node || node.x === undefined || node.z === undefined) {
			console.error("Invalid node:", node);
			return new THREE.Vector3(0, 0, 0);
		}
		let x = this.start.x + node.x * this.tileSize + this.tileSize * 0.5;
		let y = this.tileSize;
		let z = this.start.z + node.z * this.tileSize + this.tileSize * 0.5;

		return new THREE.Vector3(x, y, z);
	}

	// Method to get node from a location
	quantize(location) {
		let x = Math.floor((location.x - this.start.x) / this.tileSize);
		let z = Math.floor((location.z - this.start.z) / this.tileSize);
		let node = this.graph.getNode(x, z);
		return node;
	}

	// Debug method
	highlight(node, color) {
		let geometry = new THREE.BoxGeometry(5, 1, 5);
		let material = new THREE.MeshBasicMaterial({ color: color });
		let vec = this.localize(node);

		geometry.translate(vec.x, vec.y + 0.5, vec.z);
		this.scene.add(new THREE.Mesh(geometry, material));
	}

	// Debug method
	arrow(node, vector) {
		//normalize the direction vector (convert to vector of length 1)
		vector.normalize();

		let origin = this.localize(node);
		origin.y += 1.5;
		let length = this.tileSize;
		let hex = 0x000000;

		let arrowHelper = new THREE.ArrowHelper(vector, origin, length, hex);
		this.scene.add(arrowHelper);
	}

	// Debug method
	showHeatMap(heatmap, goal) {
		for (let [n, i] of heatmap) {
			if (n != goal) {
				// this only works because i is kind of in the hue range (0,360)
				this.highlight(n, new THREE.Color("hsl(" + i + ", 100%, 50%)"));
			}
		}
		this.highlight(goal, new THREE.Color(0xffffff));
	}

	backtrack(start, end, parents) {
		let node = end;
		let path = [];
		path.push(node);
		while (node != start) {
			path.push(parents[node.id]);
			node = parents[node.id];
		}
		return path.reverse();
	}

	manhattanDistance(node, end) {
		let nodePos = this.localize(node);
		let endPos = this.localize(end);

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);
		return dx + dz;
	}

	astar(start, end) {
		let open = new PriorityQueue();
		let closed = [];

		open.enqueue(start, 0);

		let parent = [];
		let g = [];

		for (let node of this.graph.nodes) {
			g[node.id] = node === start ? 0 : Number.MAX_VALUE;
			parent[node.id] = null;
		}

		while (!open.isEmpty()) {
			let current = open.dequeue();

			// Validate current before accessing its properties
			if (!current || !current.edges) {
				console.error("Invalid node or edges undefined", current);
				continue; // Skip this iteration if current is not valid
			}

			closed.push(current);

			if (current === end) {
				return this.backtrack(start, end, parent);
			}

			for (let edge of current.edges) {
				let neighbour = edge.node;
				let pathCost = edge.cost + g[current.id];

				if (pathCost < g[neighbour.id]) {
					parent[neighbour.id] = current;
					g[neighbour.id] = pathCost;

					if (!closed.includes(neighbour) && !open.includes(neighbour)) {
						let f = g[neighbour.id] + this.manhattanDistance(neighbour, end);
						open.enqueue(neighbour, f);
					}
				}
			}
		}
		return null; // If the loop completes without returning, no path exists
	}

	/**
	 * The method to get a node from the graph
	 * @param {*} x - The x coordinate
	 * @param {*} z - The z coordinate
	 * @returns {TileNode} - The node from the graph
	 */
	getNode(x, z) {
		const node = this.graph.getNode(x, z);
		return node;
	}

	/**
	 * The method to find the current tile
	 * @param {THREE.Vector3} location - The location vector of the bot
	 */
	getCurrentTile(location) {
		const x = Math.floor((location.x - this.start.x) / this.tileSize);
		const z = Math.floor((location.z - this.start.z) / this.tileSize);
		return this.getNode(x, z);
	}

	isTileWalkable(node) {
		// Check if the node exists and is not an obstacle
		return node && !node.isObstacle();
	}

	activatePowerUPTile() {
		this.highlight(this.powerUpTilesLocation, 0x00ff00);
	}

	resetPowerUPTile() {
		this.highlight(this.powerUpTilesLocation, 0xffff00);
	}
}
