import { Character } from "./Character.js";
import * as THREE from "three"; // Assuming State.js exports these
import { GoToPowerUP } from "./State.js";

export class Dog extends Character {
	constructor(color, gameMap, tom) {
		super(color, gameMap);
		this.topSpeed = 4;
		this.state = new GoToPowerUP();
		this.state.enterState(this);
		this.tom = tom;
	}

	/**
	 * Method to switch the state
	 * @param {State} state - The state to switch to
	 */
	switchState(state) {
		this.state = state;
		this.state.enterState(this); // Pass gameMap when entering the new state
	}

	/**
	 * Method to update the bot
	 * @param {*} deltaTime - The time since the last update
	 */
	update(deltaTime, gameMap) {
		super.update(deltaTime, gameMap);
		this.state.updateState(this);
	}

	setSpeed(topSpeed) {
		this.topSpeed = topSpeed;
	}

	getTomLocation() {
		return this.tom.location;
	}
}
