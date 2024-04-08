import { PriorityQueue } from "./PriorityQueue";

export class PathFinding {
	constructor(gameMap) {
		this.gameMap = gameMap; // Store a reference to the game map
		this.graph = gameMap.graph; // Reference to the graph within the game map
	}

	// Backtrack from the goal node to the start node using parent pointers
	backtrack(start, end, parents) {
		let node = end;
		let path = [];
		path.push(node);
		while (node !== start) {
			path.push(parents[node.id]);
			node = parents[node.id];
		}
		return path.reverse(); // Reverse the path to get the correct order from start to end
	}

	// Calculate the Manhattan distance heuristic between two nodes
	manhattanDistance(node, end) {
		let nodePos = this.gameMap.localize(node); // Get the position of the node on the game map
		let endPos = this.gameMap.localize(end); // Get the position of the end node on the game map

		let dx = Math.abs(nodePos.x - endPos.x); // Calculate the absolute difference in x coordinates
		let dz = Math.abs(nodePos.z - endPos.z); // Calculate the absolute difference in z coordinates
		return dx + dz; // Return the Manhattan distance
	}

	// A* search algorithm to find the shortest path from start to end node
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

			// Validate current node and its edges
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
