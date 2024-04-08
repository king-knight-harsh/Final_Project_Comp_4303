import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { TileNode } from "./TileNode.js";

/**
 * Class to render the map
 */
export class MapRenderer {
	/**
	 * Constructor for the MapRenderer class
	 * @param {THREE.Vector3} start - The starting position of the map
	 * @param {number} tileSize - The size of each tile
	 * @param {number} cols - The number of columns in the map
	 */
	constructor(start, tileSize, cols) {
		this.start = start;
		this.tileSize = tileSize;
		this.cols = cols;

		// Geometry for ground tiles
		this.groundGeometries = new THREE.BoxGeometry(0, 0, 0);

		// Map to manage non-terrain tiles
		this.nonTerrainTiles = new Map();

		// Array to store obstacle meshes
		this.ObstacleList = [];

		// Reference to the power-up tile mesh
		this.powerUpTile = null;
	}

	/**
	 * Method to create the rendering of the map
	 * @param {TileNode[]} graph - The graph representing the map
	 * @param {THREE.Scene} scene - The scene to render the map in
	 */
	createRendering(graph, scene) {
		for (let node of graph) {
			this.createGround(node);
			this.setTile(node, scene);
		}

		// Create the ground mesh
		let groundMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
		let ground = new THREE.Mesh(this.groundGeometries, groundMaterial);
		scene.add(ground);
	}

	/**
	 * Method to create a ground tile geometry
	 * @param {TileNode} node - The node representing the ground tile
	 */
	createGround(node) {
		let x = node.x * this.tileSize + this.start.x;
		let y = 0;
		let z = node.z * this.tileSize + this.start.z;

		let geometry = new THREE.BoxGeometry(
			this.tileSize,
			this.tileSize,
			this.tileSize
		);
		geometry.translate(
			x + 0.5 * this.tileSize,
			y + 0.5 * this.tileSize,
			z + 0.5 * this.tileSize
		);

		// Merge geometries for efficiency
		this.groundGeometries = BufferGeometryUtils.mergeGeometries([
			this.groundGeometries,
			geometry,
		]);
	}

	/**
	 * Method to set a tile in the scene
	 * @param {TileNode} node - The node representing the tile
	 * @param {THREE.Scene} scene - The scene to render the tile in
	 */
	setTile(node, scene) {
		if (this.nonTerrainTiles.has(node)) {
			scene.remove(this.nonTerrainTiles.get(node));
		}
		// Create non-ground tiles only
		if (node.type != TileNode.Type.Ground) {
			let material;
			switch (node.type) {
				case TileNode.Type.PowerUp:
					material = new THREE.MeshStandardMaterial({
						color: 0xffff00,
					});
					break;
				case TileNode.Type.Obstacle:
					material = new THREE.MeshStandardMaterial({
						color: 0x8b4513,
						visible: false,
					});
					break;
				default:
					return;
			}

			let x = node.x * this.tileSize + this.start.x;
			let y = node.type == TileNode.Type.PowerUp ? 1 : this.tileSize / 2;
			let z = node.z * this.tileSize + this.start.z;

			let geometry = new THREE.BoxGeometry(
				this.tileSize,
				this.tileSize,
				this.tileSize
			);

			let mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(
				x + this.tileSize / 2,
				y + this.tileSize / 2,
				z + this.tileSize / 2
			);

			if (node.type === TileNode.Type.PowerUp) {
				this.powerUpTile = mesh;
			}
			this.nonTerrainTiles.set(node, mesh);

			if (node.type === TileNode.Type.Obstacle) {
				this.ObstacleList.push(mesh);
			}
			scene.add(mesh);
		}
	}
}
