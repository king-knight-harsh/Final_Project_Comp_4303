export class State {
	/**
	 * Constructor for the abstract State class
	 * Ensures that subclasses implement required methods
	 */
	constructor() {
		if (this.constructor === State) {
			throw new Error("Class is of abstract type and cannot be instantiated");
		}

		if (this.enterState === undefined) {
			throw new Error("enterState method must be implemented");
		}

		if (this.updateState === undefined) {
			throw new Error("updateState method must be implemented");
		}
	}
}

/**
 * Class representing the CheckForCapture state
 */
export class CheckForCapture extends State {
	/**
	 * Method to enter the CheckForCapture state
	 * @param {object} tomArray - The Tom character
	 * @param {Array} jerryFriends - Array of Jerry's friends
	 * @param {object} dogArray - The dog character
	 * @param {THREE.Scene} scene - The scene object
	 */
	enterState(tomArray, jerryFriends, dogArray, scene) {
		jerryFriends.forEach((friend, index) => {
			if (tomArray[0] && tomArray[0].location.distanceTo(friend.location) < 1) {
				if (index === 0) {
					console.log("Tom has caught a Jerry!");
				} else {
					console.log("Tom has caught a friend!");
				}
				scene.remove(friend.gameObject);
				jerryFriends.splice(index, 1); // Remove the friend from the array
			}
		});

		if (
			tomArray[0] &&
			dogArray[0].location.distanceTo(tomArray[0].location) < 2
		) {
			console.log("Spike has captured Tom");
			scene.remove(tomArray[0].gameObject);
			tomArray.splice(0, 1);
		}

		if (jerryFriends.length === 0 || tomArray.length === 0) {
			let checkForResetState = new CheckForResetState();
			checkForResetState.enterState(jerryFriends, tomArray);
		}
	}
	/**
	 * Method to update the CheckForCapture state
	 */
	updateState() {}
}

/**
 * Class representing the CheckForResetState state
 */
export class CheckForResetState extends State {
	/**
	 * Method to enter the CheckForResetState state
	 * @param {Array} jerryFriends - Array of Jerry's friends
	 * @param {object} tom - The Tom character
	 */
	enterState(jerryFriends, tomArray) {
		if (jerryFriends.length === 0 || tomArray.length === 0) {
			let gameOverMsg;
			if (tomArray.length === 0) {
				gameOverMsg = "Jerry And Friends Won! Tom has been caught by Spike!";
			} else {
				gameOverMsg = "Tom Won! Tom caught Jerry and all his friends!";
			}
			const modalHTML = `
                <div class="modal fade" id="gameOverModal" tabindex="-1" aria-labelledby="gameOverModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="gameOverModalLabel">Game Over</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ${gameOverMsg}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" id="restartBtn">Restart</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

			document.body.insertAdjacentHTML("beforeend", modalHTML);
			const modal = new bootstrap.Modal(
				document.getElementById("gameOverModal")
			);
			modal.show();

			const modalBackdrop = document.querySelector(".modal-backdrop");
			if (modalBackdrop) {
				modalBackdrop.style.opacity = "0";
			}

			const restartBtn = document.getElementById("restartBtn");
			restartBtn.addEventListener("click", () => {
				location.reload();
			});
		}
	}

	/**
	 * Function to update the CheckForResetState state
	 */
	updateState() {}
}
