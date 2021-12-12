const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

class Ball {
    constructor(canvas, paddle) {
        {
            if (canvas === undefined || canvas === null) throw new Error();
            if (paddle === undefined || paddle === null) throw new Error();
        }

        this._ctx = canvas.getContext("2d");
        this._canvas = canvas;
        this._paddle = paddle;
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

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    reverseDX() {
        this.dx = -this.dx;
    }

    reverseDY() {
        this.dy = -this.dy;
    }

    isHorizontalCollision() {
        if (this.x + this.dx > this._canvas.width - this.radius){
            return true;
        }
        else if (this.x + this.dx < this.radius) {
            return true;
        }
        return false;
    }

    isCeilCollision() {   
        if (this.y + this.dy < this.radius) {
            return true;
        }
        return false;
    }

    isBottomCollision() {
        if (this.y + this.dy > this._canvas.height - this.radius) {
            return true;
        }
        return false;
    }

    isUncatched() {
        if (this.isBottomCollision() === true) {
            if (this.x > this._paddle.x && this.x < this._paddle.x + this._paddle.width) {
                return false;
            }
            else {
                return true; // out of bounds
            }
        }
        else {
            return false;
        }
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

const paddle = new Paddle(canvas);
const ball = new Ball(canvas, paddle);

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

const interval = setInterval(main, 10);

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bricks.forEach((arr, i, fullArray) =>
        arr.forEach((item, j, arr) => item.draw()));

    paddle.draw();
    ball.draw();

    if (ball.isHorizontalCollision() === true) {
        ball.reverseDX();
    }

    if (ball.isCeilCollision() === true) {
        ball.reverseDY();
    }
    else if (ball.isBottomCollision() === true) {
        if (ball.isUncatched() === true) {
            gameOver();
        }

        ball.reverseDY();
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

    ball.move();
}

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    }
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function gameOver() {
    alert("game over");
    document.location.reload();
    clearInterval(interval);
}