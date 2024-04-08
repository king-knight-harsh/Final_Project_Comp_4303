/**
 * Class representing a node in the tile grid
 */
export class TileNode {
	/**
	 * Types of tile nodes
	 * @readonly
	 * @enum {symbol}
	 */
	static Type = Object.freeze({
		Ground: Symbol("ground"),
		Obstacle: Symbol("obstacle"),
		PowerUp: Symbol("powerUp"),
		PowerUpActivated: Symbol("powerUpActivated"),
	});

	/**
	 * Constructor for the TileNode class
	 * @param {number} id - The identifier of the node
	 * @param {number} x - The x coordinate of the node
	 * @param {number} z - The z coordinate of the node
	 * @param {symbol} type - The type of the node
	 */
	constructor(id, x, z, type) {
		this.id = id;
		this.x = x;
		this.z = z;
		this.edges = [];
		this.type = type;
	}

	/**
	 * Try to add an edge to this node
	 * @param {TileNode} node - The node to connect an edge to
	 * @param {number} cost - The cost of the edge
	 */
	tryAddEdge(node, cost) {
		if (node.type === TileNode.Type.Ground) {
			this.edges.push({ node: node, cost: cost });
		}
	}

	/**
	 * Checks if this node is an obstacle
	 * @returns {boolean} - True if the node is an obstacle, false otherwise
	 */
	isObstacle() {
		return this.type === TileNode.Type.Obstacle;
	}

	/**
	 * Gets an edge connected to the specified node
	 * @param {TileNode} node - The node to search for an edge to
	 * @returns {Object} - The edge object, or undefined if no edge is found
	 */
	getEdge(node) {
		return this.edges.find((x) => x.node === node);
	}

	/**
	 * Checks if an edge to the specified node exists
	 * @param {TileNode} node - The node to check for an edge to
	 * @returns {boolean} - True if an edge exists, false otherwise
	 */
	hasEdge(node) {
		if (this.getEdge(node) === undefined) return false;
		return true;
	}

	/**
	 * Checks if an edge to a node with the specified coordinates exists
	 * @param {number} x - The x coordinate of the node to check for an edge to
	 * @param {number} z - The z coordinate of the node to check for an edge to
	 * @returns {boolean} - True if an edge exists, false otherwise
	 */
	hasEdgeTo(x, z) {
		let edge = this.getEdgeTo(x, z);
		if (edge === undefined) return false;
		return true;
	}

	/**
	 * Gets an edge to a node with the specified coordinates
	 * @param {number} x - The x coordinate of the node to get an edge to
	 * @param {number} z - The z coordinate of the node to get an edge to
	 * @returns {Object} - The edge object, or undefined if no edge is found
	 */
	getEdgeTo(x, z) {
		return this.edges.find((e) => e.node.x === x && e.node.z === z);
	}

	/**
	 * Checks if this node represents ground
	 * @returns {boolean} - True if the node represents ground, false otherwise
	 */
	isGround() {
		return this.type === TileNode.Type.Ground;
	}

	/**
	 * Adds an edge to this node
	 * @param {TileNode} node - The node to connect an edge to
	 * @param {number} cost - The cost of the edge
	 */
	addEdge(node, cost) {
		this.edges.push({ node, cost });
	}

	/**
	 * Log method for debugging purposes
	 */
	log() {
		let s = this.id + ": \n";
		for (let index in this.edges) {
			s +=
				"-- " +
				this.edges[index].node.id +
				": " +
				this.edges[index].cost +
				", ";
		}
		s = s.slice(0, -2);
	}
}
