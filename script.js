const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = 2;
var dy = -2;
const paddleDx = 7;
const ballRadius = 10;

const paddleHeight = 10;
const paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth) / 2;

var rightPressed = false;
var leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setInterval(draw, 1);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPaddle(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    drawBall(x, y, ballRadius);

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }

    if (rightPressed && !leftPressed) {
        paddleX += paddleDx;
        if (paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
        }
    }
    else if (leftPressed && !rightPressed) {
        paddleX -= paddleDx;
        if (paddleX < 0) {
            paddleX = 0;
        }
    }

    x += dx;
    y += dy;
}

function drawBall(x, y, ballRadius) {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#FF0000";
    ctx.fill(); 
    ctx.closePath();
}

function drawPaddle(x, y, width, height) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}