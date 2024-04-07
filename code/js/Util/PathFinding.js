import { PriorityQueue } from "./PriorityQueue";

export class PathFinding {
	constructor(gameMap) {
		this.gameMap = gameMap;
		this.graph = gameMap.graph;
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
		let nodePos = this.gameMap.localize(node); // Use this.gameMap here
		let endPos = this.gameMap.localize(end);

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);
		return dx + dz;
	}

	aStar(start, end) {
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
				let neighbor = edge.node;
				let pathCost = edge.cost + g[current.id];

				if (pathCost < g[neighbor.id]) {
					parent[neighbor.id] = current;
					g[neighbor.id] = pathCost;

					if (!closed.includes(neighbor) && !open.includes(neighbor)) {
						let f = g[neighbor.id] + this.manhattanDistance(neighbor, end);
						open.enqueue(neighbor, f);
					}
				}
			}
		}
		return null; // If the loop completes without returning, no path exists
	}
}
