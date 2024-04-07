export class CollisionDetector {
	static linePoint(v1, v2, p) {
		// get distance from the point to the two ends of the line
		let d1 = p.distanceTo(v1);
		let d2 = p.distanceTo(v2);

		// get the length of the line
		let lineLen = v1.distanceTo(v2);

		// since  are so minutely accurate, add
		// a little buffer zone that will give collision
		let buffer = 0.1; // higher # = less accurate

		// if the two distances are equal to the line's
		// length, the point is on the line!
		// note we use the buffer here to give a range,
		// rather than one #
		if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
			return true;
		}
		return false;
	}

	static circlePoint(p, c, r) {
		// get distance from the point to the two ends of the line
		let d = p.distanceTo(c);
		// if the two distances are equal to the line's
		// length, the point is on the line!
		// note we use the buffer here to give a range,
		// rather than one #
		// since  are so minutely accurate, add
		// a little buffer zone that will give collision
		let buffer = 0.1; // higher # = less accurate

		if (d <= r + buffer) {
			return true;
		}
		return false;
	}
}
