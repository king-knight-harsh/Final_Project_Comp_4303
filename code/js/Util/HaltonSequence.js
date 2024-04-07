// Halton Sequence class
export class HaltonSequence {
	/**
	 *
	 * @param {number} base - The base of the Halton sequence.
	 * @param {number} index - The index of the Halton sequence.
	 * @param {number} start - The start of the Halton sequence.
	 * @param {number} end - The end of the Halton sequence.
	 * @returns {number} The Halton sequence value.
	 */
	halton(base, index, start, end) {
		let result = 0;
		let f = 1;
		while (index > 0) {
			f = f / base;
			result += (index % base) * f;
			index = Math.floor(index / base);
		}
		return result * (end - start) + start;
	}
}
