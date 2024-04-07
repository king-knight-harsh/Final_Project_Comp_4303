import { TileNode } from "./TileNode.js";
import * as THREE from "three";
import { MapRenderer } from "./MapRenderer";
import { Graph } from "./Graph";

export class GameMap {
	// Constructor for our GameMap class
	constructor() {
		this.start = new THREE.Vector3(-25, 0, -25);

		this.width = 50;
		this.depth = 50;
		this.powerUpTile = null;
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
		this.obstacles = [];
	}

	init(scene, numberOfObstacles) {
		this.scene = scene;
		this.graph.initGraph(numberOfObstacles, this.obstacles);
		this.powerUpTile = this.graph.powerUpTile;
		this.highlight(this.powerUpTile, 0xffff00);
		this.gameObject = this.mapRenderer.createRendering(this.graph.nodes, scene);
	}

	getPowerUpTileLocation() {
		return this.powerUpTile;
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

	getObstacles() {
		return this.obstacles;
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
		this.powerUpTile.type = TileNode.Type.PowerUpActivated;
		this.highlight(this.powerUpTile, 0x00ff00);
	}

	resetPowerUPTile() {
		this.powerUpTile.type = TileNode.Type.PowerUp;
		this.highlight(this.powerUpTile, 0xffff00);
	}

	isPowerUPTileActive() {
		return this.powerUpTile.type === TileNode.Type.PowerUpActivated;
	}
}
