// Put your images in the same folder as sketch.js
// Example filenames:
// wall.jpg
// exit8.png

let wallImg;
let signImg;

function preload() {
  wallImg = loadImage("assets/images/WhiteBrick.png");
  signImg = loadImage("assets/images/Exit8.png");
}

function setup() {
  createCanvas(800, 600);
}

function draw() {
  // background color
  background(30);

  // wall image
  image(wallImg, 0, 0, width, height);

  // Exit 8 sign image
  image(signImg, 237.5, 180, 300, 140);

  // floor shape
  fill(50);
  rect(0, 500, width, 100);

  // text
  fill(0);
  textSize(28);
  textAlign(CENTER);
  text("EXIT 8", width / 2, 80);

  // smaller creepy text
  textSize(16);
  text("Do not overlook anomalies.", width / 2, 110);
}