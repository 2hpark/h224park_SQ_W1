// ============================================================
// SUSHI PLATFORMER — sketch.js
// Controls: A/D to move, W to jump
// Special: wasabi platform shrinks each landing, disappears after 4 jumps
// ============================================================

// ------------------------------------------------------------
// PLATFORMS
// Each object: { x, y, w, h, isWasabi? }
// ------------------------------------------------------------
let platforms = [
  { x: 80,  y: 310, w: 120, h: 60 },              // left low platform
  { x: 280, y: 240, w: 140, h: 60 },              // centre platform
  { x: 500, y: 170, w: 120, h: 60 },              // right high platform
  { x: 160, y: 150, w: 100, h: 60 },              // left high platform
  { x: 360, y: 320, w: 110, h: 60 },              // centre low platform
  { x: 620, y: 290, w: 130, h: 60, isWasabi: true }, // wasabi platform
];

// Store the original wasabi state so we can reset it
const WASABI_INDEX = 5;
const WASABI_ORIGINAL = { ...platforms[WASABI_INDEX] };
const WASABI_MAX_JUMPS = 4; // disappears after this many landings

// ------------------------------------------------------------
// PLAYER
// ------------------------------------------------------------
let player = {
  x: 100,
  y: 370,
  vx: 0,
  vy: 0,
  r: 20,             // collision radius & rough draw size
  speed: 0.55,
  maxSpeed: 4.5,
  jumpForce: -12,
  friction: 0.78,
  onGround: false,
  lastGroundPlatform: null,
  currentGroundPlatform: null,
};

// Physics
const GRAVITY = 0.6;

// Blob wobble timer
let blobT = 0;

// Image assets
let playerImg;
let platformTexture;
let wasabiImg;
let backgroundImg;

// ============================================================
// preload() — runs before setup(), loads all assets
// ============================================================
function preload() {
  playerImg      = loadImage('assets/images/Rice.png');
  platformTexture = loadImage('assets/images/Sashimi.png');
  wasabiImg      = loadImage('assets/images/Wasabi.png');
  backgroundImg  = loadImage('assets/images/Background.png');
}

// ============================================================
// setup()
// ============================================================
function setup() {
  createCanvas(800, 450);

  // Place player on top of the first platform
  player.y = platforms[0].y - player.r;
}

// ============================================================
// draw() — main game loop
// ============================================================
function draw() {
  // Background
  if (backgroundImg) {
    image(backgroundImg, 0, 0, width, height);
  } else {
    background(135, 206, 235); // sky blue fallback
  }

  handleInput();
  applyPhysics();
  resolvePlatformCollisions();

  drawPlatforms();
  drawPlayer();
  drawHUD();

  blobT += 0.015;
}

// ------------------------------------------------------------
// handleInput()
// ------------------------------------------------------------
function handleInput() {
  if (keyIsDown(65)) player.vx -= player.speed;  // A
  if (keyIsDown(68)) player.vx += player.speed;  // D

  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  if (!keyIsDown(65) && !keyIsDown(68)) {
    player.vx *= player.friction;
  }

  // Jump — only when on the ground
  if (keyIsDown(87) && player.onGround) {  // W
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

// ------------------------------------------------------------
// applyPhysics()
// ------------------------------------------------------------
function applyPhysics() {
  player.vy += GRAVITY;
  player.x  += player.vx;
  player.y  += player.vy;

  // Keep player inside canvas horizontally
  player.x = constrain(player.x, player.r, width - player.r);

  // Fell off the bottom → reset level
  if (player.y > height + 60) {
    resetLevel();
  }

  player.onGround = false;
}

// ------------------------------------------------------------
// resolvePlatformCollisions()
// Top-only collision: player can jump through from below.
// Wasabi platform shrinks on each new landing; disappears after WASABI_MAX_JUMPS.
// ------------------------------------------------------------
function resolvePlatformCollisions() {
  player.currentGroundPlatform = null;

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    // Skip invisible / gone platforms
    if (p.gone) continue;

    let playerLeft   = player.x - player.r;
    let playerRight  = player.x + player.r;
    let playerBottom = player.y + player.r;

    let platLeft  = p.x;
    let platRight = p.x + p.w;
    let platTop   = p.y;

    let overlapsHorizontally = playerRight > platLeft && playerLeft < platRight;
    let landingOnTop =
      player.vy >= 0 &&
      playerBottom >= platTop &&
      playerBottom <= platTop + 20;

    if (overlapsHorizontally && landingOnTop) {
      player.y  = platTop - player.r;
      player.vy = 0;
      player.onGround = true;
      player.currentGroundPlatform = i;

      // --- Wasabi shrink logic ---
      if (p.isWasabi && player.lastGroundPlatform !== i) {
        p.jumpsOnIt = (p.jumpsOnIt || 0) + 1;

        if (p.jumpsOnIt >= WASABI_MAX_JUMPS) {
          // Platform disappears
          p.gone = true;
          player.onGround = false; // player will now fall
        } else {
          // Shrink width toward centre each landing
          let shrinkAmount = WASABI_ORIGINAL.w / WASABI_MAX_JUMPS;
          p.w = max(WASABI_ORIGINAL.w - p.jumpsOnIt * shrinkAmount, 10);
          // Keep platform visually centred as it shrinks
          p.x = WASABI_ORIGINAL.x + (WASABI_ORIGINAL.w - p.w) / 2;
        }
      }
    }
  }

  player.lastGroundPlatform = player.currentGroundPlatform;
}

// ------------------------------------------------------------
// drawPlatforms()
// Draw each platform by stretching the assigned texture to its hitbox.
// The special wasabi platform uses its own image.
// ------------------------------------------------------------
function drawPlatforms() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    if (p.gone) continue;

    if (p.isWasabi) {
      if (wasabiImg) {
        drawImageFitPlatform(wasabiImg, p);
      } else {
        fill(105, 200, 80);
        noStroke();
        rect(p.x, p.y, p.w, p.h, 6);
      }
    } else if (platformTexture) {
      drawImageFitPlatform(platformTexture, p);
    } else {
      fill(255, 160, 50);
      noStroke();
      rect(p.x, p.y, p.w, p.h, 6);
    }
  }
}

// ------------------------------------------------------------
// drawImageFitPlatform(img, p)
// Draws `img` exactly to the platform hitbox size.
// ------------------------------------------------------------
function drawImageFitPlatform(img, p) {
  image(img, p.x, p.y, p.w, p.h);
}

// ------------------------------------------------------------
// drawPlayer()
// Draws Rice.png if loaded, otherwise falls back to blob.
// ------------------------------------------------------------
function drawPlayer() {
  if (playerImg) {
    push();
    imageMode(CENTER);
    // Scale to fit within r*2.5 on the longest side, preserving aspect ratio
    let aspect  = playerImg.width / playerImg.height;
    let maxSize = player.r * 2.5;
    let drawW   = aspect >= 1 ? maxSize : maxSize * aspect;
    let drawH   = aspect >= 1 ? maxSize / aspect : maxSize;
    image(playerImg, player.x, player.y, drawW, drawH);
    pop();
  } else {
    // Fallback wobbling blob
    push();
    fill(240, 240, 220);
    noStroke();
    beginShape();
    let numPoints = 48;
    for (let i = 0; i < numPoints; i++) {
      let angle    = (TWO_PI / numPoints) * i;
      let noiseVal = noise(cos(angle) * 0.8 + blobT, sin(angle) * 0.8 + blobT);
      let r        = player.r + map(noiseVal, 0, 1, -6, 6);
      vertex(player.x + cos(angle) * r, player.y + sin(angle) * r);
    }
    endShape(CLOSE);
    fill(10);
    ellipse(player.x - 6, player.y - 5, 6, 6);
    ellipse(player.x + 6, player.y - 5, 6, 6);
    pop();
  }
}

// ------------------------------------------------------------
// drawHUD()
// ------------------------------------------------------------
function drawHUD() {
  fill(50);
  noStroke();
  textSize(13);
  textAlign(LEFT, TOP);

  // Show wasabi jump count if platform is still alive
  let w = platforms[WASABI_INDEX];
  let wasabiInfo = w.gone
    ? "Wasabi: gone!"
    : `Wasabi: ${w.jumpsOnIt || 0}/${WASABI_MAX_JUMPS} jumps`;

  text(`Move: A/D   Jump: W   ${wasabiInfo}   Fall = reset`, 12, 12);
}

// ------------------------------------------------------------
// resetLevel()
// Resets the player and wasabi platform back to their start state.
// ------------------------------------------------------------
function resetLevel() {
  // Reset player
  player.x  = 100;
  player.y  = platforms[0].y - player.r;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.lastGroundPlatform = null;
  player.currentGroundPlatform = null;

  // Reset wasabi platform
  let w = platforms[WASABI_INDEX];
  w.x         = WASABI_ORIGINAL.x;
  w.y         = WASABI_ORIGINAL.y;
  w.w         = WASABI_ORIGINAL.w;
  w.h         = WASABI_ORIGINAL.h;
  w.gone      = false;
  w.jumpsOnIt = 0;
}