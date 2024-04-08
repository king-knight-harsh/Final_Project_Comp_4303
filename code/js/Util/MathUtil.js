/**
 * A utility class containing static methods for mathematical operations frequently used in graphics and simulations.
 * This class offers functions for linear interpolation (lerp) and mapping a value from one range to another (map),
 * both of which are essential in animations, simulations, or any scenario requiring smooth transitions between values or remapping of value ranges.
 *
 * Methods:
 * - lerp(a, b, t): Linearly interpolates between two values `a` and `b` by a factor `t`.
 * - map(x, a, b, c, d): Remaps a value `x` from the range [a, b] to [c, d].
 */
export class MathUtil {
	/**
	 * Performs linear interpolation between two values.
	 *
	 * Linear interpolation is a method of curve fitting using linear polynomials. This function calculates the value
	 * at a specified point `t` between `0` and `1` along the straight line between two given points `a` and `b`.
	 * When `t` is `0`, it returns `a`. When `t` is `1`, it returns `b`. For values of `t` between `0` and `1`, it returns
	 * a value between `a` and `b` that represents the interpolation factor `t`.
	 *
	 * @param {number} a - The start value.
	 * @param {number} b - The end value.
	 * @param {number} t - The interpolation factor between `0` and `1`.
	 * @returns {number} The interpolated value between `a` and `b`.
	 */
	static lerp(a, b, t) {
		return a + t * (b - a);
	}

	/**
	 * Maps a value from one range to another.
	 *
	 * This method takes a value `x` in the range [a, b] and maps it to its corresponding value in the range [c, d].
	 * The mapping is performed linearly such that `a` maps to `c`, `b` maps to `d`, and values in between are mapped
	 * accordingly in a linear fashion. This function is useful for scenarios such as normalizing data, adjusting scales,
	 * or converting between different measurement units.
	 *
	 * @param {number} x - The value to remap.
	 * @param {number} a - The lower bound of the original range.
	 * @param {number} b - The upper bound of the original range.
	 * @param {number} c - The lower bound of the target range.
	 * @param {number} d - The upper bound of the target range.
	 * @returns {number} The value of `x` mapped to the new range [c, d].
	 */
	static map(x, a, b, c, d) {
		return ((x - a) / (b - a)) * (d - c) + c;
	}
}
