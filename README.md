# Tom's Maze Chase

Tom's Maze Chase is an exciting game where players take control of Tom, the cat, in a challenging maze environment. The objective is to catch all the mice, led by Jerry, while avoiding obstacles and evading Spike, who is also on the hunt. Players must strategically navigate the maze, collect the power-up tile to gain temporary advantage, and outwit Spike to emerge victorious.

## Team Members

1. [Harsh Sharma](https://github.com/king-knight-harsh)
2. [Sahil Mahey](https://github.com/SahilMahey)

## Table of Contents

- [Key Features](#key-features)
- [Additional Features](#additional-features)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Video Demo](#video-demo)
- [Contributing](#contributing)
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

1. Characters can respawn randomly.
2. Spike can avoid obstacles using single ray collision algorithm.
3. Obstacles have been placed using Halton sequence.
4. Ground tiles use perlin noise to add terrain and smooth texture.
5. Tom, jerry, and Spike go through various state changes using state.js


## Technical Stack

- **UI and Logic Development:** Three.js


## Project Structure

```plaintext
code/
  css/
    main.css
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

## Video Demo

1. [Full Video Demonstration](https://youtu.be/lKLkdpRI8Xg)

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code. We appreciate your contributions and hope Tom's Maze Chase brings joy to your gaming adventures! 🍲🚀
