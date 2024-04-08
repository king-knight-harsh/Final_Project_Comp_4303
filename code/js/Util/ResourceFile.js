/**
 * A collection of resource file descriptors for 3D models used in a game, including characters and objects.
 * Each item in the array is an object that specifies the name and URL path to the GLB format model file.
 * These models represent various characters like Tom the cat, Jerry the mouse, Spike the dog, and Jerry's friends,
 * as well as game environment elements such as buildings. This structured approach allows for easy reference and
 * loading of 3D models by their names throughout the game's codebase, facilitating the management of game assets.
 *
 */
export let resourceFiles = [
	{ name: "tom", url: "/Models/cat/tom.glb" }, // Tom the cat model
	{ name: "jerry", url: "/Models/mouse/jerry.glb" }, // Jerry the mouse model
	{ name: "spike", url: "/Models/Dog/spike.glb" }, // Spike the dog model
	{ name: "jerryFriend1", url: "/Models/mouse/jerryFriendOne.glb" }, // Friend 1 of Jerry
	{ name: "jerryFriend2", url: "/Models/mouse/jerryFriendTwo.glb" }, // Friend 2 of Jerry
	{ name: "jerryFriend3", url: "/Models/mouse/jerryFriendThree.glb" }, // Friend 3 of Jerry
	{ name: "building1", url: "/Models/building/large_building_0.glb" }, // Large building model
	{ name: "building2", url: "/Models/building/large_building_1.glb" }, // Large building model
	{ name: "building3", url: "/Models/building/large_building_2.glb" }, // Large building model
	{ name: "building4", url: "/Models/building/large_building_3.glb" }, // Large building model
	{ name: "building5", url: "/Models/building/large_building_4.glb" }, // Large building model
];
