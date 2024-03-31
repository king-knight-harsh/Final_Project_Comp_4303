export class Noise {
	constructor(seed) {
		this.seed = seed;
	}

	random(x, y) {
		let n = x + y * 57;
		n = (n << 13) ^ n;
		return (
			1.0 -
			((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0
		);
	}

	// Linear interpolation
	lerp(a, b, t) {
		return a + t * (b - a);
	}

	// Generate noise based on grid x and y
	noise(x, y) {
		const xf = Math.floor(x);
		const yf = Math.floor(y);

		// Interpolate between corner values
		const tl = this.random(xf, yf);
		const tr = this.random(xf + 1, yf);
		const bl = this.random(xf, yf + 1);
		const br = this.random(xf + 1, yf + 1);

		const xt = this.lerp(tl, tr, x - xf);
		const xb = this.lerp(bl, br, x - xf);

		return this.lerp(xt, xb, y - yf);
	}
}
