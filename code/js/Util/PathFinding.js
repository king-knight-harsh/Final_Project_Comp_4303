import { PriorityQueue } from "./PriorityQueue";

/**
 * A class implementing A* search algorithm for pathfinding on a graph represented within a game map.
 * This class provides functionality to find the shortest path between two nodes in a graph using the A* search algorithm,
 * which is efficient and effective for pathfinding and graph traversal. The algorithm combines features of uniform-cost search
 * and pure heuristic search to efficiently compute optimal paths. This implementation also includes methods for backtracking to reconstruct
 * the path from start to end and calculating the Manhattan distance as a heuristic for the A* search.
 */
export class PathFinding {
	constructor(gameMap) {
		this.gameMap = gameMap; // Store a reference to the game map
		this.graph = gameMap.graph; // Reference to the graph within the game map
	}

	/**
	 * Backtracks from the goal node to the start node to reconstruct the path.
	 * It uses parent pointers to trace the path from end to start and then reverses it
	 * to return the path in the correct order from start to end.
	 *
	 * @param {Object} start - The start node of the path.
	 * @param {Object} end - The end node of the path.
	 * @param {Array} parents - An array of parent pointers used to backtrack the path.
	 * @returns {Array} An array of nodes representing the path from start to end.
	 */
	backtrack(start, end, parents) {
		let node = end;
		let path = [];
		path.push(node);
		while (node !== start) {
			node = parents[node.id];
			path.push(node);
		}
		return path.reverse(); // Reverse the path to get the correct order from start to end
	}

	/**
	 * Calculates the Manhattan distance between two nodes as a heuristic for the A* search algorithm.
	 * The Manhattan distance is the sum of the absolute differences of their coordinates on the game map.
	 *
	 * @param {Object} node - The current node.
	 * @param {Object} end - The end node.
	 * @returns {number} The Manhattan distance between the current node and the end node.
	 */
	manhattanDistance(node, end) {
		let nodePos = this.gameMap.localize(node); // Get the position of the node on the game map
		let endPos = this.gameMap.localize(end); // Get the position of the end node on the game map

		let dx = Math.abs(nodePos.x - endPos.x); // Calculate the absolute difference in x coordinates
		let dz = Math.abs(nodePos.z - endPos.z); // Calculate the absolute difference in z coordinates
		return dx + dz; // Return the Manhattan distance
	}

	/**
	 * Implements the A* search algorithm to find the shortest path from start to end node.
	 * This method uses a priority queue to dynamically select the next node to explore based on
	 * a cost function (g) and a heuristic function (h). The algorithm finds the lowest cost path
	 * by exploring paths that appear to be leading closer to the end.
	 *
	 * @param {Object} start - The start node.
	 * @param {Object} end - The end node.
	 * @returns {Array|null} The shortest path from start to end as an array of nodes, or null if no path exists.
	 */
	aStar(start, end) {
		let open = new PriorityQueue(); // Priority queue to store nodes to be explored
		let closed = []; // List to store nodes that have been explored

		open.enqueue(start, 0); // Enqueue the start node with priority 0

		let parent = []; // Array to store parent pointers for backtracking
		let g = []; // Array to store the cost from start to each node

		for (let node of this.graph.nodes) {
			g[node.id] = node === start ? 0 : Number.MAX_VALUE; // Initialize costs, start node cost is 0, others are set to infinity
			parent[node.id] = null; // Initialize parent pointers to null
		}

		while (!open.isEmpty()) {
			let current = open.dequeue(); // Dequeue the node with the lowest priority (based on current cost + heuristic)

			if (!current || !current.edges) {
				console.error("Invalid node or edges undefined", current);
				continue; // Skip this iteration if current node is not valid
			}

			closed.push(current); // Add current node to the list of explored nodes

			if (current === end) {
				return this.backtrack(start, end, parent); // If the goal node is reached, backtrack to reconstruct the path
			}

			for (let edge of current.edges) {
				let neighbor = edge.node; // Get the neighboring node
				let pathCost = edge.cost + g[current.id]; // Calculate the total cost from start to neighbor through current node

				if (pathCost < g[neighbor.id]) {
					parent[neighbor.id] = current; // Update parent pointer for the neighbor node
					g[neighbor.id] = pathCost; // Update the cost from start to neighbor

					if (!closed.includes(neighbor) && !open.includes(neighbor)) {
						let f = g[neighbor.id] + this.manhattanDistance(neighbor, end); // Calculate the priority (cost + heuristic)
						open.enqueue(neighbor, f); // Enqueue the neighbor with its priority
					}
				}
			}
		}

		return null; // If the loop completes without returning, no path exists from start to end
	}
}
