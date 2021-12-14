const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

class Ball {
    constructor(canvas) {
        {
            if (canvas === undefined || canvas === null) throw new Error();
        }

        this._ctx = canvas.getContext("2d");
        this._canvas = canvas;
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
}

class OuterBound {
    constructor(ball, canvas) {
        {
            if (ball === undefined || ball === null) throw new Error();
            if (canvas === undefined || canvas === null) throw new Error();
        }

        this._ball = ball;
        this._canvas = canvas;
    }

    hasHorizontalCollision() {
        if (this._ball.x >= this._canvas.width - this._ball.radius) {
            return true;
        }
        else if (this._ball.x <= this._ball.radius) {
            return true;
        }
        return false;
    }

    hasCeilCollision() {   
        if (this._ball.y <= this._ball.radius) {
            return true;
        }
        return false;
    }

    hasBottomCollision() {
        if (this._ball.y >= this._canvas.height - this._ball.radius) {
            return true;
        }
        return false;
    }
}

class Paddle {
    constructor(canvas, x, y) {
        {
            if (canvas === undefined || canvas === null) throw new Error(); 
        }
        
        this.x = x;
        this.y = y;
        this._ctx = canvas.getContext("2d");
        this._canvas = canvas;
    }

    get height() { return 10; }
    get width() { return 75; }
    get dx() { return 7; }

    draw() {
        this._ctx.beginPath();
        this._ctx.rect(this.x,
                       this.y,
                       this.width,
                       this.height);
        this._ctx.fillStyle = "#0095DD";
        this._ctx.fill();
        this._ctx.closePath();
    }

    hasCollision(ball) {
        return collides(ball, this);
    }

    static get defaultHeight() { return 10; }
}

class Brick {
    constructor(ctx, x, y, width, height) {
        this.x = x;
        this.y = y;
        this._width = width;
        this._height = height; 
        this._ctx = ctx;
    }

    get width() { return this._width; }
    get height() { return this._height; }

    draw() {
        this._ctx.beginPath();
        this._ctx.rect(this.x, this.y, this.width, this.height);
        this._ctx.fillStyle = "#0095DD";
        this._ctx.fill();
        this._ctx.closePath();
    }

    hasCollision(ball) {
        return collides(ball, this);
    }

    static get defaultWidth() { return 75; }
    static get defaultHeight() { return 20; }
    static get defaultPadding() { return 10; }
}

const paddle = new Paddle(canvas, 
                          (canvas.width - 75) / 2,
                          canvas.height - Paddle.defaultHeight);

const brickCount = { 'row': 3, 'column': 5, };
const brickOffset = { 'top' : 30, 'left' : 30, }; 
const bricks = Array.from(
    { length: brickCount.column },
    (_, c) => Array.from(
        { length: brickCount.row },
        (_, r) => new Brick(
            ctx,
            (c * (Brick.defaultWidth + Brick.defaultPadding)) + brickOffset.left,
            (r * (Brick.defaultHeight + Brick.defaultPadding)) + brickOffset.top,
            Brick.defaultWidth,
            Brick.defaultHeight)));

const ball = new Ball(canvas, paddle);
const outerBound = new OuterBound(ball, canvas);

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

const interval = setInterval(main, 10);

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bricks.flat().forEach(b => b.draw());

    paddle.draw();
    ball.draw();

    if (bricks.flat().some(b => b.hasCollision(ball)) === true) {
        ball.reverseDY();
    }
    
    if (paddle.hasCollision(ball) === true) {
        ball.reverseDY();
    }
    
    if (outerBound.hasHorizontalCollision() === true) {
        ball.reverseDX();
    }
    
    if (outerBound.hasCeilCollision() === true) {
        ball.reverseDY();
    }
    else if (outerBound.hasBottomCollision() === true) {
        gameOver();
    }

    if (rightPressed === true && leftPressed === false) {
        paddle.x += paddle.dx;
        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }
    else if (leftPressed === true && rightPressed === false) {
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

function collides(circle, rect){
    var distX = Math.abs(circle.x - rect.x - rect.width / 2);
    var distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) { return false; }
    if (distY > (rect.height / 2 + circle.radius)) { return false; }

    if (distX <= (rect.width / 2)) { return true; } 
    if (distY <= (rect.height / 2)) { return true; }

    var dx = distX - rect.width / 2;
    var dy = distY - rect.height / 2;
    const collide = (dx * dx + dy * dy <= (circle.radius ** 2));
    return collide;
}
