# Tom's Maze Chase

Tom's Maze Chase is an exciting game where players take control of Tom, the cat, in a challenging maze environment. The objective is to catch all the mice, led by Jerry, while avoiding obstacles and evading Spike, who is also on the hunt. Players must strategically navigate the maze, collect the power-up tile to gain temporary advantage, and outwit Spike to emerge victorious.

## Team Members

1. [Harsh Sharma](https://github.com/king-knight-harsh) - 201961844
2. [Sahil Mahey](https://github.com/SahilMahey) - 201964327

## Table of Contents

- [Key Features](#key-features)
- [Rules and Additional Feature](#additional-features)
- [Concept Covered](#concept-covered)
- [Description Behaviour Folder](#description-behaviour-folder)
- [Description World Folder](#description-world-folder)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Video Demo](#video-demo)
- [License](#license)

## Key Features

- **Dynamic Maze Environment:**
  - Navigate through a maze filled with obstacles and a single power-up tile using up, down, left and right arrow Keyboard keys.
  
- **Character Variety**
  - Play as Tom, catch Jerry and his friends, and save yourself from Spike.

- **Power-Up Tile**
  - Collection of the single power-up tile will increase speed for Tom, Jerry and his friends will get the power to become invisible while Spike will get a power to catch Tom using an A* algorithm with increased speed.

- **Strategic Gameplay**
  - Plan your moves carefully to catch all the mice while avoiding obstacles and outsmarting Spike.

- **Restart Game**
  - Restart after winning or losing the game.

## Additional Features

1. Jerry and Friends avoid collision through 4 ray collision detection.
2. Spike uses A* algorithm to catch Tom and go to power up tile.
3. Characters respawn randomly if it get stuck inside an obstacle.
4. Tom, Jerry, and Spike have different speeds.
5. PowerUP Ability:
    - Tom: Speed increase (2x).
    - Jerry and Friends: Invisibility for 10 second.
    - Spike: Speed increase (2x) and A* algorithm to catch Tom.
6. Game Over:
    - Tom catches all Jerry and Friends.
    - Spike catches Tom.
7. Ground tiles use Perlin noise to add elevation.

## Concept Covered

1. **Complex Movement Algorithms** - Using Wander and Collision Avoidance for Jerry and Friends to avoid collision and tom to effectively move around the maze.
2. **Path Finding** - Using A* algorithm for Spike to catch Tom and go to power up tile.
3. **Decision Making** - Using state machine for Tom, Jerry, and Spike to change their state based on the game. Using State machine to checking for capture and game reset state.
4. **Procedural Generation** - Using Perlin noise to generate to add elevation to the ground tiles.
5. **Other topic used** - Using Halton sequence to place the Obstacles randomly on the table.

## Description Behaviour Folder

1. **Character.js**
    - Introduces the `Character` class, the base class for all characters within the game, providing a common structure and behavior.
    - Encapsulates shared properties and methods, ensuring a unified framework for character dynamics.
    - Includes an `update` method executed every frame, responsible for refreshing the character's position and state in response to game interactions.

2. **Cat.js**
    - Defines the `Tom` class, designated for the player character, extending the `Character` class with unique properties and functionalities.
    - Focuses on character-specific attributes and methods that define Tom's role and actions within the game environment.
    - The `update` method is a crucial part of this class, updating Tom's state and position every frame according to gameplay dynamics and player inputs.

3. **Dog.js**
    - The file creates the `Dog` class, another character in the game, inheriting from `Character` and adding specialized behaviors and roles.
    - Tailors properties and methods to fit the specific needs and functionalities of the Dog character within the game's narrative.
    - Contains an `update` method for `Dog`, ensuring that the character's state and position are appropriately updated each frame to match the gameplay.

4. **Mouse.js**
    - Introduces the `Mouse` class, adding to the game's character roster by extending the `Character` class with unique traits.
    - Adapts the inherited structure to include distinct properties and methods that reflect the Mouse character's unique contributions to the game.
    - Incorporates a dedicated `update` method for `Mouse`, tasked with regularly updating the character's state and position in line with game events.

5. **State.js**
    - Outlines the abstract `State` class, providing a template for defining various character states within the game.
    - Mandates the implementation of `enterState` and `updateState` methods in subclasses, dictating behaviors for entering states and logic for updates.
    - Facilitates the application of the State Design Pattern, enabling dynamic behavior changes for characters based on the game's context.

6. **Controller.js**
    - Defines the `Controller` class, which handles input from the player and translates it into actions within the game.
    - Processes keyboard events to control the direction and actions of the player's character, bridging player inputs with game responses.
    - Enables interactive gameplay, ensuring that player commands are effectively reflected in the game through character actions and movements.

## Description World Folder

1. **GameMap.js**
    - Represents the game map within which the characters navigate.
    - Initializes with default dimensions, tile size, and starting points.
    - Includes methods to set up the map, add obstacles, power-up tiles, and render the entire map within a scene.
    - Utilizes the `Graph` class to manage spatial relationships and pathfinding.
    - Manages power-up tile states and interactions.

2. **Graph.js**
    - Constructs a graph representing the spatial layout of the game map.
    - Nodes within the graph represent tiles on the game map, including obstacles, ground, and special tiles like power-ups.
    - Supports initialization with a specified number of obstacles randomly placed.
    - Handles connections between nodes to facilitate pathfinding and movement across the map.

3. **MapRenderer.js**
    - Responsible for the visual representation of the `GameMap`.
    - Uses Three.js to create and manage 3D geometry for the map's tiles, obstacles, and special features.
    - Incorporates a procedural generation technique to vary the terrain and obstacle appearance.
    - Updates the scene with map elements based on their types and states.

4. **Perlin.js**
    - Implements Perlin noise generation for the procedural generation of map features.
    - Used by the `MapRenderer` to create varied and visually appealing terrain.
    - Supports octave noise for more complex patterns in terrain generation.

5. **TileNode.js**
    - Represents a single tile in the game map's graph.
    - Can be of several types, including ground, obstacle, and power-up.
    - Stores information about its position, connections to other tiles, and type-specific properties.
    - Used extensively in path finding and map generation logic.

## Description Util Folder

1. **HaltonSequence**

    - Generates values in the Halton sequence, useful for quasi-random distribution within a specified range.
    - Particularly helpful for placing game objects non-uniformly but systematically within the game world.

2. **initializeCharacters**

    - Positions key game characters (like Tom, a dog, and Jerry's friends) at random, non-overlapping locations on the game map.
    - Adds these characters to the scene, ensuring they're rendered within the game environment.

3. **MathUtil**

    - A utility class providing essential mathematical operations such as linear interpolation (`lerp`) and value range mapping (`map`).
    - Critical for animations, simulations, and adjusting value scales across the game.

4. **PathFinding**

    - Implements the A* search algorithm for efficient pathfinding on the game's map, facilitating character movements and AI behaviors.
    - Offers methods for reconstructing paths and calculating distances using heuristics like the Manhattan distance.

5. **PriorityQueue**

    - A support class for the PathFinding algorithm, managing nodes in a prioritized order to efficiently find the shortest path.
    - Utilizes a binary heap structure for performance in operations like enqueue, dequeue, and peek.

6. **Resources**

    - Manages the loading and accessing of 3D model resources, such as characters and objects, for the game.
    - Supports both `.glb` (GLTF) and `.fbx` formats, facilitating the use of complex 3D models in Three.js projects.

7. **VectorUtil**

    - Provides a suite of vector operations crucial for 3D calculations, including addition, subtraction, scalar multiplication, and projection.
    - Enables sophisticated spatial computations needed for realistic animations, physics, and user interactions.

8. **ResourceFiles**

    - An array containing descriptors for various 3D models used in the game, including characters like Tom and Jerry, and objects like buildings.
    - Serves as a centralized repository for model paths, streamlining asset management and loading processes.

## Technical Stack

- **UI and Logic Development:** Three.js, Javascript

## Project Structure

```plaintext
code/
  js/
    /Game
      /Behaviour
        /Cat.js
        /Character.js
        /Controller.js
        /Dog.js
        /Mouse.js
        /State.js
      /World
        /GameMap.js
        /Graph.js
        /MapRenderer.js
        /Perlin.js
        /TileNode.js
    /Util
      /CameraSetup.js
      /HaltonSequence.js
      /InitializeCharacter.js
      /MathUtil.js
      /PathFinding.js
      /PriorityQueue.js
      /ResourceFile.js
      /Resources.js
      /VectorUtil.js
    main.js
  /node_moudles
  /public
    /Models
      /building
        large_building.glb
      /cat
        /tom.glb
      /Dog
        /spike.glb
      /mouse
        /jerry.glb
        /jerryFriendOne.glb
        /jerryFriendThree.glb
        /jerryFriendTwo.glb
  index.html
  package.json
  README.md
Documents
  Project_Proposal_Comp_4303.pdf
  Term Project Proposal.pdf
  Term Project.pdf
.gitignore
README.md
```

##

## Getting Started

1. Clone the repository.
2. Open the terminal and navigate to the code directory.
3. Run the following command to install the required dependencies:

   ```bash
   yarn install three
   yarn install vite --dev
   ```

4. Run the following command to start the development server:

   ```bash
    yarn dev
    ```

## Video Demo

1. [Full Video Demonstration](https://youtu.be/26rO_-AhsxE)

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code. We appreciate your contributions and hope Tom's Maze Chase brings joy to your gaming adventures! 🍲🚀
