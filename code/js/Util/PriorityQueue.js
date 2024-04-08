/**
 * Implements a priority queue with a binary heap structure to efficiently manage elements in a prioritized order.
 * The PriorityQueue class provides essential operations such as enqueue, dequeue, and peek, alongside utilities to check if
 * it contains a specific node, and methods to maintain the heap property upon modification. This class is fundamental for algorithms
 * requiring sorted access to elements, such as the A* pathfinding algorithm, where nodes are prioritized by their estimated cost
 * from the start to the end node.
 */
export class PriorityQueue {
	/**
	 * Initializes a new instance of the PriorityQueue class.
	 */
	constructor() {
		this.storage = [];
	}

	/**
	 * Checks if the priority queue is empty.
	 *
	 * @returns {boolean} True if the priority queue is empty, false otherwise.
	 */
	isEmpty() {
		return this.storage.length == 0;
	}

	/**
	 * Calculates the index of the parent node for a node at the given index.
	 *
	 * @param {number} index - The index of the node whose parent index is to be calculated.
	 * @returns {number} The index of the parent node.
	 */
	getParentIndex(index) {
		return Math.floor((index - 1) / 2);
	}

	/**
	 * Calculates the index of the left child node for a node at the given index.
	 *
	 * @param {number} index - The index of the node whose left child index is to be calculated.
	 * @returns {number} The index of the left child node.
	 */
	getLeftChildIndex(index) {
		return 2 * index + 1;
	}

	/**
	 * Calculates the index of the right child node for a node at the given index.
	 *
	 * @param {number} index - The index of the node whose right child index is to be calculated.
	 * @returns {number} The index of the right child node.
	 */
	getRightChildIndex(index) {
		return 2 * index + 2;
	}

	/**
	 * Test if the node at the provided index has a parent.
	 *
	 * @param {number} index - The index of the node to check for a parent.
	 * @returns {boolean} True if the node has a parent, false otherwise.
	 */
	hasParent(index) {
		return this.getParentIndex(index) >= 0;
	}

	/**
	 * Test if the node at the provided index has a left child.
	 *
	 * @param {number} index - The index of the node to check for a left child.
	 * @returns {boolean} True if the node has a left child, false otherwise.
	 */
	hasLeftChild(index) {
		return this.getLeftChildIndex(index) < this.storage.length;
	}

	/**
	 * Test if the node at the provided index has a right child.
	 *
	 * @param {number} index - The index of the node to check for a right child.
	 * @returns {boolean} True if the node has a right child, false otherwise.
	 */
	hasRightChild(index) {
		return this.getRightChildIndex(index) < this.storage.length;
	}

	/**
	 * Returns the parent node of the node at the provided index.
	 *
	 * @param {number} index - The index of the node whose parent is to be retrieved.
	 * @returns {Object} The parent node.
	 */
	parent(index) {
		return this.storage[this.getParentIndex(index)];
	}

	/**
	 * Returns the left child of a node at the provided index.
	 *
	 * @param {number} index - The index of the node whose left child is to be retrieved.
	 * @returns {Object} The left child node.
	 */
	leftChild(index) {
		return this.storage[this.getLeftChildIndex(index)];
	}

	/**
	 * Returns the right child of a node at the provided index.
	 *
	 * @param {number} index - The index of the node whose right child is to be retrieved.
	 * @returns {Object} The right child node.
	 */
	rightChild(index) {
		return this.storage[this.getRightChildIndex(index)];
	}

	/**
	 * Tests if the priority queue includes a particular node.
	 *
	 * @param {Object} node - The node to check for in the priority queue.
	 * @returns {boolean} True if the node is in the priority queue, false otherwise.
	 */
	includes(node) {
		for (let i in this.storage) {
			if (this.storage[i][0] == node) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Swaps the nodes at the provided indices in the priority queue.
	 *
	 * @param {number} index1 - The index of the first node to swap.
	 * @param {number} index2 - The index of the second node to swap.
	 */
	swap(index1, index2) {
		let temp = this.storage[index1];
		this.storage[index1] = this.storage[index2];
		this.storage[index2] = temp;
	}

	/**
	 * Returns the node with the highest priority (lowest numerical value) from the queue without removing it.
	 *
	 * @returns {Object} The node with the highest priority.
	 */
	peek() {
		return this.storage[0];
	}

	/**
	 * Adds a node with the specified priority to the priority queue.
	 *
	 * @param {Object} node - The node to be added to the queue.
	 * @param {number} priority - The priority of the node.
	 */
	enqueue(node, priority) {
		let data = [node, priority];
		this.storage[this.storage.length] = data;

		this.heapifyUp(this.storage.length - 1);
	}

	/**
	 * Maintains the heap property by recursively swapping nodes upwards until the parent node has a lower priority.
	 *
	 * @param {number} index - The index of the node to heapify up.
	 */
	heapifyUp(index) {
		if (
			this.hasParent(index) &&
			this.parent(index)[1] > this.storage[index][1]
		) {
			this.swap(this.getParentIndex(index), index);
			this.heapifyUp(this.getParentIndex(index));
		}
	}

	/**
	 * Removes and returns the node with the highest priority (lowest numerical value) from the queue.
	 *
	 * @returns {Object} The node with the highest priority.
	 */
	dequeue() {
		if (this.storage.length == 0) return null;
		let data = this.storage[0];
		this.storage[0] = this.storage[this.storage.length - 1];
		this.storage.splice(this.storage.length - 1, 1);
		this.heapifyDown(0);
		return data[0];
	}

	/**
	 * Restores the heap property by recursively swapping nodes downwards until the parent node has a lower priority.
	 *
	 * @param {number} index - The index of the node to heapify down.
	 */
	heapifyDown(index) {
		let smallest = index;
		if (
			this.hasLeftChild(index) &&
			this.storage[smallest][1] > this.leftChild(index)[1]
		) {
			smallest = this.getLeftChildIndex(index);
		}
		if (
			this.hasRightChild(index) &&
			this.storage[smallest][1] > this.rightChild(index)[1]
		) {
			smallest = this.getRightChildIndex(index);
		}
		if (smallest != index) {
			this.swap(index, smallest);
			this.heapifyDown(smallest);
		}
	}

	/**
	 * Removes the provided node from the priority queue if it exists. If it does not exist, an error is returned.
	 *
	 * @param {Object} node - The node to remove from the priority queue.
	 * @returns {Error} An error if the node does not exist in the priority queue.
	 */
	remove(node) {
		let index = -1;
		for (let i in this.storage) {
			if (this.storage[i][0] == node) {
				index = i;
			}
		}
		if ((index = -1)) {
			return Error(
				"Node with ID: " + node.id + " cannot be removed as it does not exist"
			);
		}

		this.storage[index] = this.storage[this.storage.length - 1];
		this.storage.splice(this.storage.length - 1, 1);
		this.heapifyDown(index);
	}
}
