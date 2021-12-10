const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

class Ball {
    constructor(canvas) {
        {
            if (canvas === undefined || canvas === null) throw new Error();
        }

        this._ctx = canvas.getContext("2d");
        this.x = canvas.width / 2;
        this.y = canvas.height - 30;
        this.dx = 2;
        this.dy = -2;
    }

    get radius() { return 10; }

    draw() {
        this._ctx.beginPath();
        this._ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        this._ctx.fillStyle = "#FF0000";
        this._ctx.fill(); 
        this._ctx.closePath();
    }
}

class Paddle {
    constructor(canvas) {
        {
            if (canvas === undefined || canvas === null) throw new Error(); 
        }
        
        this.x = (canvas.width - 75) / 2;
        this._ctx = canvas.getContext("2d");
        this._canvas = canvas;
    }

    get height() { return 10; }
    get width() { return 75; }
    get dx() { return 7; }

    draw() {
        this._ctx.beginPath();
        this._ctx.rect(this.x,
                       this._canvas.height - this.height,
                       this.width,
                       this.height);
        this._ctx.fillStyle = "#0095DD";
        this._ctx.fill();
        this._ctx.closePath();
    }
}

class Brick {
    constructor(ctx, x, y) {
        this.x = x;
        this.y = y;
        this._ctx = ctx;
    }

    draw() {
        this._ctx.beginPath();
        this._ctx.rect(this.x, this.y, Brick.width, Brick.height);
        this._ctx.fillStyle = "#0095DD";
        this._ctx.fill();
        this._ctx.closePath();
    }

    static get width() { return 75; }
    static get height() { return 20; }
    static get padding() { return 10; }
}

const ball = new Ball(canvas);
const paddle = new Paddle(canvas);

const brickCount = { 'row': 3, 'column': 5, };
const brickOffset = { 'top' : 30, 'left' : 30, }; 
const bricks = Array.from(
    {length: brickCount.column},
    (_, c) => Array.from(
        {length: brickCount.row},
        (_, r) => new Brick(
            ctx,
            (c * (Brick.width + Brick.padding)) + brickOffset.left,
            (r * (Brick.height + Brick.padding)) + brickOffset.top)));

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

const interval = setInterval(draw, 10);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bricks.forEach((arr, i, fullArray) =>
        arr.forEach((item, j, arr) => item.draw()));

    paddle.draw();
    ball.draw();

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