# Week 2 Example 2: Platformer with Platforms Array

## What This Example Demonstrates

> **Note for students:** This section is included in example files only to help you study. Do not include it in your Side Quest submissions.

This example builds on Example 1 by replacing the single floor with an array of platforms, and introducing top-only collision detection so the player can land on any of them.

- **Array of objects** — platforms are stored as a list of objects, each with `x`, `y`, `w`, and `h` properties; adding a new platform only requires adding one line of data
- **`for` loop** — used to draw and check collisions for every platform without writing separate code for each one; the same pattern applies to enemies, coins, tiles, and any other collection of objects
- **Bounding box collision** — collision is detected by checking whether the player's edges overlap with a platform's edges horizontally and vertically
- **Top-only landing** — the check only triggers when the player is falling downward (`vy >= 0`) onto the top surface, so the player can jump up through platforms from below
- **Collision tolerance** — a small buffer (`+ 20`) prevents the player from clipping through platforms at higher speeds
- **Reset on fall** — if the player falls off the bottom of the canvas, their position and velocity are reset to the starting point
- **`keyIsDown()`** — checks if a key is held this frame for smooth continuous movement
- **`constrain()`** — clamps a value within a range; used to cap speed and keep the player inside the canvas
- **`noise()` / `map()`** — used together to animate the blob's wobbly edges organically
- **`push()` / `pop()`** — save and restore drawing settings so styles in one function don't affect others

## Setup and Interaction Instructions

To run the sketch locally, open `index.html` in Google Chrome using Live Server.

**Controls:**

- Move left/right: Arrow Keys or A/D
- Jump: Up Arrow or W
- Fall off the screen to reset to the start

**Opening the Chrome Console**

- **Windows:** Press `F12` or `Ctrl + Shift + J`, then click the **Console** tab
- **Mac:** Press `Cmd + Option + J`

The console will show any errors in your sketch.

## Assets

No external assets used. All visuals are generated with p5.js.

## References

N/A
