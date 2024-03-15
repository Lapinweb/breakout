const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let rightPressed = false;
let leftPressed = false;

/****************************************************************/
//Score
const score = {
   value: 0,

   draw() {
      ctx.font = "16px Arial";
      ctx.fillStyle = "purple";
      ctx.fillText(`Score: ${this.value}`, 8, 20);
   },
};

//Lives
let player = {
   lives: 3,

   drawLives() {
      ctx.font = "16px Arial";
      ctx.fillStyle = "purple";
      ctx.fillText(`Lives: ${this.lives}`, canvas.width - 65, 20);
   },
};

//Ball
const ball = {
   x: canvas.width / 2,
   y: canvas.height - 30,
   vx: 5,
   vy: -5,
   radius: 25,
   color: "violet",

   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
   },
};

//Paddle
const paddle = {
   height: 10,
   width: 125,
   color: "violet",

   init() {
      this.x = (canvas.width - this.width) / 2;
   },

   draw() {
      ctx.beginPath();
      ctx.rect(this.x, canvas.height - this.height, this.width, this.height);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
   },
};

//Brickwall
const brickwall = {
   row: 3,
   column: 4,
   width: 124,
   height: 30,
   padding: 15,
   offsetTop: 35,
   offsetLeft: 30,
   bricks: [],

   init() {
      if (this.bricks.length === 0) {
         for (let c = 0; c < this.column; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.row; r++) {
               this.bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
         }
      }
   },

   draw() {
      for (let c = 0; c < this.column; c++) {
         for (let r = 0; r < this.row; r++) {
            if (this.bricks[c][r].status === 1) {
               const brickX = c * (this.width + this.padding) + this.offsetLeft;
               const brickY = r * (this.height + this.padding) + this.offsetTop;

               this.bricks[c][r].x = brickX;
               this.bricks[c][r].y = brickY;
               ctx.beginPath();
               ctx.rect(brickX, brickY, this.width, this.height);
               ctx.fillStyle = "purple";
               ctx.fill();
               ctx.closePath();
            }
         }
      }
   },
};

/***************************************************************/

//draw
function draw() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   brickwall.draw();
   ball.draw();
   paddle.draw();
   score.draw();
   player.drawLives();
   collisionDetection();

   //if the ball touch the walls horizontally, reverse vx
   if (
      ball.x + ball.vx > canvas.width - ball.radius ||
      ball.x + ball.vx < ball.radius
   ) {
      ball.vx = -ball.vx;
   }
   //if the ball touch the ceiling
   if (ball.y + ball.vy < ball.radius) {
      ball.vy = -ball.vy;
   }
   //if the ball touch the floor
   else if (ball.y + ball.vy > canvas.height - ball.radius) {
      //touch the paddle
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width)
         ball.vy = -ball.vy;
      else {
         if (ball.y + ball.vy > canvas.height + ball.radius) {
            player.lives--;
            if (!player.lives) {
               alert("GAME OVER");
               document.location.reload();
            } else {
               ball.x = canvas.width / 2;
               ball.y = canvas.height - 30;
               ball.vx = 5;
               ball.vy = -5;
               paddle.x = (canvas.width - paddle.width) / 2;
            }
         }
      }
   }

   //keypress
   if (rightPressed) {
      paddle.x = Math.min(paddle.x + 7, canvas.width - paddle.width);
   } else if (leftPressed) {
      paddle.x = Math.max(paddle.x - 7, 0);
   }

   //move the ball
   ball.x += ball.vx;
   ball.y += ball.vy;

   requestAnimationFrame(draw);
}

//Keys
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
   if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = true;
   } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = true;
   }
}

function keyUpHandler(e) {
   if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = false;
   } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = false;
   }
}

//mouse movements
document.addEventListener("mousemove", mouseMoveHandler);

function mouseMoveHandler(e) {
   const relativeX = e.clientX - canvas.offsetLeft;
   if (relativeX > 0 && relativeX < canvas.width) {
      paddle.x = relativeX - paddle.width / 2;
   }
}

//collision
function collisionDetection() {
   for (let c = 0; c < brickwall.column; c++) {
      for (let r = 0; r < brickwall.row; r++) {
         const b = brickwall.bricks[c][r];
         if (
            ball.x > b.x &&
            ball.x < b.x + brickwall.width &&
            ball.y > b.y &&
            ball.y < b.y + brickwall.height &&
            b.status === 1
         ) {
            ball.vy = -ball.vy;
            b.status = 0;
            score.value += 100;
            if (score.value === brickwall.row * brickwall.column * 100) {
               alert("YOU WIN, CONGRATULATIONS!");
               document.location.reload();
            }
         }
      }
   }
}

/*****************************************************************/
//init
paddle.init()
brickwall.init();

//draw
draw();
