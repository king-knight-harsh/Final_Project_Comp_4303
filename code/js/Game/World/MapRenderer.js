import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { TileNode } from "./TileNode.js";

export class MapRenderer {
	constructor(start, tileSize, cols) {
		this.start = start;
		this.tileSize = tileSize;
		this.cols = cols;

		this.groundGeometries = new THREE.BoxGeometry(0, 0, 0);
		// Use a map to manage non-terrain tiles
		this.nonTerrainTiles = new Map();
	}

	createRendering(graph, scene) {
		for (let node of graph) {
			this.createGround(node);
			this.setTile(node, scene);
		}
		let groundMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });

		let ground = new THREE.Mesh(this.groundGeometries, groundMaterial);
		scene.add(ground);
	}

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

		this.groundGeometries = BufferGeometryUtils.mergeGeometries([
			this.groundGeometries,
			geometry,
		]);
	}

	setTile(node, scene) {
		if (this.nonTerrainTiles.has(node)) {
			scene.remove(this.nonTerrainTiles.get(node));
		}
		// Only create non-ground tiles
		if (node.type != TileNode.Type.Ground) {
			let material;
			switch (node.type) {
				case TileNode.Type.PowerUp:
					material = new THREE.MeshStandardMaterial({
						color: 0xffff00,
					});
					break;
				case TileNode.Type.Obstacle:
					material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
					break;
				default:
					return;
			}

			if (node.type != TileNode.Type.Ground) {
				let x = node.x * this.tileSize + this.start.x;
				let y =
					node.type == TileNode.Type.Obstacle
						? this.tileSize
						: this.tileSize / 2;
				let z = node.z * this.tileSize + this.start.z;

				let geometry = new THREE.BoxGeometry(
					this.tileSize,
					this.tileSize,
					this.tileSize
				);
				geometry.translate(x + 0.5 * this.tileSize, y, z + 0.5 * this.tileSize);

				let mesh = new THREE.Mesh(geometry, material);
				this.nonTerrainTiles.set(node, mesh);
				scene.add(mesh);
			}

			let x = node.x * this.tileSize + this.start.x;
			let y = this.tileSize / 2;
			let z = node.z * this.tileSize + this.start.z;

			let geometry = new THREE.BoxGeometry(
				this.tileSize,
				this.tileSize,
				this.tileSize
			);
			geometry.translate(x + 0.5 * this.tileSize, y, z + 0.5 * this.tileSize);

			let mesh = new THREE.Mesh(geometry, material);
			this.nonTerrainTiles.set(node, mesh);
			scene.add(mesh);
		}
	}
}
