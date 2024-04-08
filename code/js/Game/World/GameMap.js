import { TileNode } from "./TileNode.js";
import * as THREE from "three";
import { MapRenderer } from "./MapRenderer";
import { Graph } from "./Graph";

/**
 * Class representing the game map
 */
export class GameMap {
	/**
	 * Constructor for the GameMap class
	 */
	constructor() {
		// Define the starting point of the map
		this.start = new THREE.Vector3(-25, 0, -25);

		// Define the width and depth of the map
		this.width = 50;
		this.depth = 50;

		// Define the size of each tile in the map
		this.tileSize = 5;

		// Initialize variables for power-up tile and goal
		this.powerUpTile = null;
		this.goal = null;

		// Calculate the number of columns and rows based on width, depth, and tile size
		this.cols = this.width / this.tileSize;
		this.rows = this.depth / this.tileSize;

		// Create a graph representing the map layout
		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		// Create a map renderer for visualizing the map
		this.mapRenderer = new MapRenderer(
			this.start,
			this.tileSize,
			this.cols,
			this.rows
		);

		// Initialize a flow field map
		this.flowfield = new Map();

		// Initialize an array to store obstacles
		this.obstacles = [];
	}

	/**
	 * Method to initialize the game map
	 * @param {THREE.Scene} scene - The scene to render the map
	 * @param {number} numberOfObstacles - The number of obstacles to generate
	 */
	init(scene, numberOfObstacles) {
		this.scene = scene;

		// Initialize the graph with obstacles
		this.graph.initGraph(numberOfObstacles);

		// Render the map in the scene
		this.gameObject = this.mapRenderer.createRendering(this.graph.nodes, scene);

		// Retrieve the list of obstacles from the map renderer
		this.obstacles = this.mapRenderer.ObstacleList;

		// Retrieve the position of the power-up tile from the map renderer
		this.powerUpTile = this.mapRenderer.powerUpTile;
	}

	/**
	 * Method to get the position of the power-up tile
	 * @returns {THREE.Vector3} - The position of the power-up tile
	 */
	getPowerUpTileLocation() {
		return this.powerUpTile.position;
	}

	/**
	 * Method to convert a node to its corresponding location in 3D space
	 * @param {TileNode} node - The node to localize
	 * @returns {THREE.Vector3} - The localized node
	 */
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

	/**
	 * Method to find the node corresponding to a given location in 3D space
	 * @param {THREE.Vector3} location - The location in 3D space
	 * @returns {TileNode} - The node corresponding to the location
	 */
	quantize(location) {
		let x = Math.floor((location.x - this.start.x) / this.tileSize);
		let z = Math.floor((location.z - this.start.z) / this.tileSize);
		let node = this.graph.getNode(x, z);
		return node;
	}

	/**
	 * Method to retrieve a node from the graph
	 * @param {number} x - The x coordinate of the node
	 * @param {number} z - The z coordinate of the node
	 * @returns {TileNode} - The node from the graph
	 */
	getNode(x, z) {
		const node = this.graph.getNode(x, z);
		return node;
	}

	/**
	 * Method to retrieve the list of obstacles
	 * @returns {TileNode[]} - The list of obstacles
	 */
	getObstacles() {
		return this.obstacles;
	}

	/**
	 * Method to check if a tile is walkable
	 * @param {TileNode} node - The node to check
	 * @returns {boolean} - True if the tile is walkable, false otherwise
	 */
	isTileWalkable(node) {
		// Check if the node exists and is not an obstacle
		return node && !node.isObstacle();
	}

	/**
	 * Method to activate the power-up tile
	 */
	activatePowerUPTile() {
		let powerUpTile = this.quantize(this.getPowerUpTileLocation());
		powerUpTile.type = TileNode.Type.PowerUpActivated;
		this.powerUpTile.material.color.setHex(0x00ff00);
	}

	/**
	 * Method to reset the power-up tile
	 */
	resetPowerUPTile() {
		let powerUpTile = this.quantize(this.getPowerUpTileLocation());
		powerUpTile.type = TileNode.Type.PowerUp;
		this.powerUpTile.material.color.setHex(0xffff00);
	}

	/**
	 * Method to check if the power-up tile is active
	 * @returns {boolean} - True if the power-up tile is active, false otherwise
	 */
	isPowerUPTileActive() {
		let powerUpTile = this.quantize(this.getPowerUpTileLocation());
		return powerUpTile.type === TileNode.Type.PowerUpActivated;
	}
}
