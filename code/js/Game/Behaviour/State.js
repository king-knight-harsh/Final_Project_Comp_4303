export class State {
	// Creating an abstract class in JS
	// Ensuring enterState and updateState are implemented
	constructor() {
		if (this.constructor == State) {
			throw new Error("Class is of abstract type and cannot be instantiated");
		}

		if (this.enterState == undefined) {
			throw new Error("enterState method must be implemented");
		}

		if (this.updateState == undefined) {
			throw new Error("updateState method must be implemented");
		}
	}
}

export class CheckForCapture extends State {
	enterState(jerry, tom, jerryFriends, dog, scene) {
		// Check if Jerry has been captured
		if (jerry && tom && tom.location.distanceTo(jerry.location) < 1.5) {
			console.log("Tom has caught Jerry!");
			scene.remove(jerry.gameObject);
			jerry = null;
		}
		// Filter Jerry's friends to remove any that Tom catches
		jerryFriends = jerryFriends.filter((friend) => {
			// Ensure tom is not null before accessing its location
			if (tom && tom.location.distanceTo(friend.location) < 1.5) {
				console.log("Tom has caught a friend!");
				scene.remove(friend.gameObject);
				return false;
			}
			return true;
		});
		if (
			tom &&
			dog.location.distanceTo(tom.location) < 1.5 &&
			!dog.isPowerActivated
		) {
			console.log("spike has captured tom");
			scene.remove(tom.gameObject);
			tom = null;
		}
		// Modify the reset state check to not rely on tom's existence
		if ((!jerry && jerryFriends.length === 0) || tom === null) {
			let checkForResetState = new CheckForResetState();
			// You might need to adjust the CheckForResetState class to handle tom being null
			checkForResetState.enterState(jerry, jerryFriends, tom);
		}
	}

	updateState(jerry, tom, jerryFriends, dog, scene) {
		this.enterState(jerry, tom, jerryFriends, dog, scene);
	}
}
export class CheckForResetState extends State {
	enterState(jerry, jerryFriends, tom) {
		// The logic previously in checkForReset
		if ((!jerry && jerryFriends.length === 0) || !tom) {
			const modalHTML = `
            <div class="modal fade" id="gameOverModal" tabindex="-1" aria-labelledby="gameOverModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="gameOverModalLabel">Game Over</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            All characters have been caught!
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

	updateState(jerry, tom, jerryFriends) {
		this.enterState(jerry, tom, jerryFriends);
	}
}
