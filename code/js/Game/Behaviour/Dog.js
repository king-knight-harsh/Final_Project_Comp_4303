import { Character } from "./Character.js";
import * as THREE from "three"; // Assuming State.js exports these

export class Dog extends Character {
	constructor(color) {
		super(color);
        this.topSpeed = 4;
		
	}
	getCurrentTile(gameMap) {
		return gameMap.quantize(this.location);
	}
	
	
	// Set the model for the character
	



}
