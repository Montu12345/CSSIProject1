/* global createCanvas, rect, colorMode, HSB, background, height, width, random, 
           noStroke, fill, ellipse, windowWidth, windowHeight, HSL, collideRectCircle, textSize, text, keyIsDown, color  */
let paddle1, ball, ballDiameter, paddle2, gameIsPlaying, time, gameWon, red, blue;

const GAME_TIME = 1000;
const W_KEY_CODE = 87, S_KEY_CODE = 83, UP_KEY_CODE = 38, DOWN_KEY_CODE = 40;
const BALL_DIAMETER = 10;
const GLOBAL_S = 50;
const GLOBAL_B = 100;
const TEXT_ALIGN = 20;

//https://keycode.info/
function setup() {
  createCanvas(400, 300);
  //change color mode
  colorMode(HSB, 360, 100, 100);
  
  //creates game ball
  ball = new Ball();
  
  //paddle 1 is on the left side and controlled by wasd
  //paddle 2 is on the right side and controled by up down
  red = color(0, GLOBAL_S, GLOBAL_B);
  blue = color(180, GLOBAL_S, GLOBAL_B);
  paddle1 = new Paddle(20, 100, W_KEY_CODE, S_KEY_CODE, red);
  paddle2 = new Paddle(width - 30, 100, UP_KEY_CODE, DOWN_KEY_CODE, blue);
  
  //only turns true once a game has played to avoid a winning message before the first game
  gameWon = false;
  
  gameIsPlaying = false;
  time = GAME_TIME;
}

function draw() {
  //drawn every frame to avoid trails
  background(0, 0, 0);
  
  //putting text with the score and time
  textSize(10);
  fill(red)
  text(`Player 1 Score: ${paddle1.score}`, 10, TEXT_ALIGN);
  fill(blue)
  text(`Player 2 Score: ${paddle2.score}`, width - 100, TEXT_ALIGN);
  fill('white')
  text(`Timer: ${time}`, width/2 - 30, TEXT_ALIGN)
  
  //drawing in both paddles on the screen
  paddle1.drawPaddle();
  paddle2.drawPaddle();
  
  //nothing moves or is interactive until space is pressed
  if(gameIsPlaying){
    paddle1.updatePosition();
    paddle2.updatePosition();
    ball.updatePosition();
    ball.drawBall();
    handleTime();
    gameWon = true;
  }
  //represents when the game has yet to start or has finished
  else{        
    textSize(16)
    fill('white')
    text('Press Space to Start Play', width/2 - 95, height / 2);
    //when a game has finished, display score stuff
    if(gameWon){
      if(paddle1.score > paddle2.score){
        text('Player 1 Wins', width/2 - 50, height / 2 - 30)
      } else if(paddle1.score < paddle2.score) {
        text('Player 2 Wins', width/2 - 50, height / 2 - 30)
      } else {
        text("There's a tie", width/2 - 50, height / 2 - 30)
      }
    }
  }

  //spacebar pressed restarts game
  if(keyIsDown(32)) {
    restart();
  }  
}
//decreases time. when time gets to 0, stop game
function handleTime(){
  if(time > 0){
    time--
  } else {
    gameIsPlaying = false;
  }
}

//returns true if there is collision between the paddle and the ball. Returns false otherwise.
function checkBallPaddleCollision(){
  return collideRectCircle(paddle1.x, paddle1.y, paddle1.w, paddle1.h, ball.x, ball.y, BALL_DIAMETER) || collideRectCircle(paddle2.x, paddle2.y, paddle2.w, paddle2.h, ball.x, ball.y, BALL_DIAMETER);
}
  
//paddle is controlled by the player
class Paddle {
  constructor(xpos, ypos, upCode, downCode, color) {
    this.x = xpos;
    this.y = ypos;
    this.w = 10;
    this.h = 40;
    //represents the key code corresponding to this paddle (up/down arrow or wasd)
    this.upkey = upCode;
    this.downkey = downCode;
    this.score = 0;
    //how far the paddle moves with each btuton press
    this.increment = 10;
    this.color = color;
  }
  
  //functions used every loop in the draw function:
  
  //makes a rectangle to represent the paddle
  drawPaddle(){
    fill(this.color);
    rect(this.x, this.y, this.w, this.h);
  }
  
  //moves the paddle up and down
  updatePosition() {
    //called when up arrow or w is pressed
    if(keyIsDown(this.upkey)){
      if(this.y > 0){
        this.y -= this.increment;
      }
    } 
    //called when down arrow or s is pressed
    if(keyIsDown(this.downkey)){
      if(this.y < height - this.h){
        this.y += this.increment;
      }
    }
  }
}

class Ball {
  //constructors the ball
  constructor(){
    //starts in the center
    this.x = width / 2;
    this.y = height / 2;
    this.xVel = 5;
    this.diam = BALL_DIAMETER;
    this.yVel = 2;
    this.maxSpeed = 4;
    this.lastCollisionTime = GAME_TIME;
    this.color = color(random(360), GLOBAL_S, GLOBAL_B);
  }
  
  //resets the current Ball object
  restart() {
    //puts it in the center
    this.x = width / 2;
    this.y = height / 2;
    //random velocity that can be negative or positive but not zero
    this.xVel = random([random(2, this.maxSpeed), random(-1*this.maxSpeed, -2)])
    this.yVel = random([random(2, this.maxSpeed), random(-1*this.maxSpeed, -2)])
    this.lastCollisionTime = GAME_TIME;
    this.color = color(random(360), GLOBAL_S, GLOBAL_B);
  }
  
  //function used to move the ball (checks for collisions as well)
  updatePosition(){
    //When the ball hits a paddle, change its direction and color.
    if (checkBallPaddleCollision() && this.lastCollisionTime - time > 2){
      this.xVel *= -1 * random(0.5, 1.5);
      this.yVel *= -1 * random(0.5, 1.5);
      this.lastCollisionTime = time;
      this.color = color(random(360), GLOBAL_S, GLOBAL_B);
    }
    
    //when the ball hits the right or left edge, a point is scoreed and the ball resets
    if (this.x > width - this.diam/2 || this.x < 0){
      this.xVel *= -1;
      keepScore(this, paddle1, paddle2);
      this.restart()
    }
    
    //bouncing off the top and bottom
    if (this.y > height - this.diam/2 || this.y < 0){
      this.yVel *= -1;
    }
    
    //updating position after calculations
    this.x += this.xVel;
    this.y += this.yVel;
  }
  
  //function used to draw the ball
  drawBall(){
    fill(this.color);
    ellipse(this.x, this.y, this.diam);
  }
}

//function to keep track of score
function keepScore(ball, paddle1, paddle2){
  if (ball.x > paddle2.x){
    paddle1.score += 1;
  }
  if (ball.x < paddle1.x){
    paddle2.score += 1;
  }
  
}

//restarts game (scores, time)
function restart(){
  time = GAME_TIME; 
  paddle1.score = 0;
  paddle2.score = 0;
  ball.restart();
  gameIsPlaying = true;

}

