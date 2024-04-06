import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { MathUtil } from '../../Util/MathUtil.js';

export class Perlin {

    constructor(size) {

    	this.size = size;
    	this.gradients = [];

    	for (let i = 0; i < this.size; i++) {
    		this.gradients[i] = [];
    		for (let j = 0; j < this.size; j++) {
    			let x = MathUtil.map(Math.random(), 0, 1, -1, 1);
    			let y = MathUtil.map(Math.random(), 0, 1, -1, 1);
    			this.gradients[i][j] = new THREE.Vector2(x,y);
    		}
    	}
    }

    noise(mX, mY, zoom) {

    	let x = (mX * zoom) % this.size;
    	let y = (mY * zoom) % this.size;

    	let x0 = Math.floor(x);
    	let y0 = Math.floor(y);

    	let x1 = (x0 + 1) % this.size;
    	let y1 = (y0 + 1) % this.size;

    	let xoffset = x - x0;
    	let yoffset = y - y0;

    	let pos = new THREE.Vector2(xoffset, yoffset);

    	let dx0y0 = VectorUtil.sub(pos, new THREE.Vector2(0,0));
    	let dx1y0 = VectorUtil.sub(pos, new THREE.Vector2(1,0));
    	let dx0y1 = VectorUtil.sub(pos, new THREE.Vector2(0,1));
    	let dx1y1 = VectorUtil.sub(pos, new THREE.Vector2(1,1));

    	let dot1 = this.gradients[x0][y0].dot(dx0y0);
    	let dot2 = this.gradients[x1][y0].dot(dx1y0);
    	let dot3 = this.gradients[x0][y1].dot(dx0y1);
    	let dot4 = this.gradients[x1][y1].dot(dx1y1);

    	let fadedXOffset = this.fade(xoffset);
    	let fadedYOffset = this.fade(yoffset);

    	let lerp1 = MathUtil.lerp(dot1, dot2, fadedXOffset);
    	let lerp2 = MathUtil.lerp(dot3, dot4, fadedXOffset);
    	let average = MathUtil.lerp(lerp1, lerp2, fadedYOffset);

    	return MathUtil.map(average, -1, 1, 0, 1);
    }

    fade(t) {
    	return t * t * t * (t * (t * 6 - 15) + 10);
    }

    octaveNoise(x, y, zoom, numOctaves, persistence) {
    	let total = 0;
    	let localzoom = 1;
    	let amplitude = 1;
    	let maxValue = 0;

    	for (let i = 0; i < numOctaves; i++) {

    		total = total + this.noise(x,y,localzoom*zoom) * amplitude;

    		maxValue = maxValue + amplitude;

    		amplitude = amplitude * persistence;
    		localzoom = localzoom * 2;
    	}
    	return total/maxValue;
    }




}