const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

class Ball 
{
    constructor(canvasWidth, canvasHeight) {
        {
            if (canvasWidth === undefined || canvasWidth === null) throw new Error();
            if (canvasHeight === undefined || canvasHeight === null) throw new Error(); 
        }

        this.x = canvasWidth / 2;
        this.y = canvasHeight - 30;
        this.dx = 2;
        this.dy = -2;
    }

    get radius() { return 10; }
}

class Paddle
{
    constructor(canvasWidth) {
        {
            if (canvasWidth === undefined || canvasWidth === null) throw new Error(); 
        }
        
        this.x = (canvasWidth - 75) / 2;
    }

    get height() { return 10; }
    get width() { return 75; }
    get dx() { return 7; }
}

const ball = new Ball(canvas.width, canvas.height)
const paddle = new Paddle(canvas.width);

var rightPressed = false;
var leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

const interval = setInterval(draw, 10);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawpaddle(paddle.x, canvas.height-paddle.height, paddle.width, paddle.height);
    drawBall(ball.x, ball.y, ball.radius);

    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        }
        else {
            alert("game over");
            document.location.reload();
            clearInterval(interval);
        }
    }

    if (rightPressed && !leftPressed) {
        paddle.x += paddle.dx;
        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }
    else if (leftPressed && !rightPressed) {
        paddle.x -= paddle.dx;
        if (paddle.x < 0) {
            paddle.x = 0;
        }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;
}

function drawBall(x, y, ballRadius) {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#FF0000";
    ctx.fill(); 
    ctx.closePath();
}

function drawpaddle(x, y, width, height) {
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