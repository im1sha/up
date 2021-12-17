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
            if (x === undefined || x === null) throw new Error(); 
            if (y === undefined || y === null) throw new Error(); 
        }
        
        this.x = x;
        this.y = y;
        this._ctx = canvas.getContext("2d");
        this._canvas = canvas;
    }

    get height() { return Paddle.defaultHeight; }
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
        {
            if (ctx === undefined || ctx === null) throw new Error(); 
            if (x === undefined || x === null) throw new Error(); 
            if (y === undefined || y === null) throw new Error(); 
            if (width === undefined || width === null) throw new Error(); 
            if (height === undefined || height === null) throw new Error(); 
        }
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

const ball = new Ball(canvas);
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

function collides(circle, rect) {  
    const cases = [
        new Case(circle.radius, circle.y, circle.x, rect.x, rect.y, rect.y + rect.height),
        new Case(circle.radius, circle.y, circle.x, rect.x + rect.width, rect.y, rect.y + rect.height),
        new Case(circle.radius, circle.x, circle.y, rect.y, rect.x, rect.x + rect.width),
        new Case(circle.radius, circle.x, circle.y, rect.y + rect.height, rect.x, rect.x + rect.width),
    ];
    
    return cases.some((c, i, _) => { 
        const intersection = getIntersection(c.radius, c.axis1Center, c.axis2Center, c.axis2Coordinate);
        const result = intersection >= c.axis1Min && intersection <= c.axis1Max;
        if (result === true) { console.log(c.toString()); }
        return result;
    });

    function getIntersection(r, asix1Center, asix2Center, asix2Coordinate) {
        return Math.sqrt(r ** 2 - (asix2Coordinate - asix2Center) ** 2) + asix1Center;
    }   
}

class Case {
    constructor(radius, axis1Center, axis2Center, axis2Coordinate, axis1Min, axis1Max) {
        {
            if (radius === undefined || radius === null) throw new Error(); 
            if (axis1Center === undefined || axis1Center === null) throw new Error(); 
            if (axis2Center === undefined || axis2Center === null) throw new Error(); 
            if (axis2Coordinate === undefined || axis2Coordinate === null) throw new Error(); 
            if (axis1Min === undefined || axis1Min === null) throw new Error(); 
            if (axis1Max === undefined || axis1Max === null) throw new Error(); 
        }
        this.radius = radius;
        this.axis1Center = axis1Center;
        this.axis2Center = axis2Center;
        this.axis2Coordinate = axis2Coordinate;
        this.axis1Min = axis1Min;
        this.axis1Max = axis1Max;
    }

    toString() {
        return 'R: ' + this.radius +
            ', a1c: ' + this.axis1Center +
            ', a2c: ' + this.axis2Center +
            ', a2: ' + this.axis2Coordinate +
            ', a1min: ' + this.axis1Min +
            ', a1max: ' + this.axis1Max; 
    }
}