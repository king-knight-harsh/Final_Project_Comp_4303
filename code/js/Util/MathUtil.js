export class MathUtil {

	static lerp(a, b, t) {
		return a + t * (b - a);
	}

	static map(x, a, b, c, d) {
		return (x-a)/(b-a) * (d-c) + c;
	}

}