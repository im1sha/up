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

    positiveDX() {
        this.dx = Math.abs(this.dx);
    }

    negativeDX() {
        this.dx = -Math.abs(this.dx);
    }

    positiveDY() {
        this.dy = Math.abs(this.dy);
    } 
    
    negativeDY() {
        this.dy = -Math.abs(this.dy)
    }

    handleCollision(brickCollisions) {
        const bottom = brickCollisions.some(c => c.position === CollisionPosition.bottom);
        const left = brickCollisions.some(c => c.position === CollisionPosition.left);
        const right = brickCollisions.some(c => c.position === CollisionPosition.right);
        const top = brickCollisions.some(c => c.position === CollisionPosition.top);

        if (top === true && bottom === false) {
            this.negativeDY();
        } 
        else if (top === false && bottom === true) {
            this.positiveDY();
        }

        if (left === true && right === false) {
            this.negativeDX();
        }
        else if (left === false && right === true) {
            this.positiveDX();
        }

        return [...new Set(brickCollisions.map((v, i, _) => v.object))];
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

    hasRightWallCollision() {
        if (this._ball.x >= this._canvas.width - this._ball.radius) {
            return true;
        }       
        return false;
    }

    hasLeftWallCollision() {
        if (this._ball.x <= this._ball.radius) {
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

    collisions(ball) {
        return intersects(ball, this);
    }

    static get defaultWidth() { return 75; }
    static get defaultHeight() { return 20; }
    static get defaultPadding() { return 10; }
}

class Paddle extends Brick {
    constructor(ctx, x, y, width, height, canvas) {
        {
            if (canvas === undefined || canvas === null) throw new Error(); 
        }
        super(ctx, x, y, width, height);

        this.rightPressed = false;
        this.leftPressed = false;
    
        this.canvas = canvas;
        document.addEventListener("keydown", e => this.keyDownHandler(e, this), false);
        document.addEventListener("keyup", e => this.keyUpHandler(e, this), false);
        document.addEventListener("mousemove", e => this.mouseMoveHandler(e, this), false);
    }
    
    move() {
        if (this.rightPressed === true && this.leftPressed === false) {
            this.x = this.normalizePosition(this, this.x + this.dx);        
        }
        else if (this.leftPressed === true && this.rightPressed === false) {
            this.x = this.normalizePosition(this, this.x - this.dx);        
        }
    }

    mouseMoveHandler(e, paddle) {
        const relativeX = e.clientX - paddle.canvas.offsetLeft;
        paddle.x = paddle.normalizePosition(paddle, relativeX);
    }

    keyDownHandler(e, paddle) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            paddle.rightPressed = true;
        }
        else if (e.key === "Left" || e.key === "ArrowLeft") {
            paddle.leftPressed = true;
        }
    }
    
    keyUpHandler(e, paddle) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            paddle.rightPressed = false;
        }
        else if (e.key === "Left" || e.key === "ArrowLeft") {
            paddle.leftPressed = false;
        }
    }

    normalizePosition(paddle, position) {
        if (position + paddle.width > paddle.canvas.width) {
            return paddle.canvas.width - paddle.width;
        }
        else if (position < 0) {
            return 0;
        }
        else {
            return position;
        } 
    }

    static get defaultHeight() { return 10; }
    static get defaultWidth() { return 75; }
    get dx() { return 7; }
}

const paddle = new Paddle(
    ctx,
    (canvas.width - Paddle.defaultWidth) / 2,
    canvas.height - Paddle.defaultHeight,
    Paddle.defaultWidth,
    Paddle.defaultHeight,
    canvas);

const brickCount = { 'row': 3, 'column': 5, };
const brickOffset = { 'top' : 30, 'left' : 30, }; 
let bricks = Array.from(
    { length: brickCount.column },
    (_, c) => Array.from(
        { length: brickCount.row },
        (_, r) => new Brick(
            ctx,
            (c * (Brick.defaultWidth + Brick.defaultPadding)) + brickOffset.left,
            (r * (Brick.defaultHeight + Brick.defaultPadding)) + brickOffset.top,
            Brick.defaultWidth,
            Brick.defaultHeight)))
    .flat();

let ball = new Ball(canvas);
let outerBound = new OuterBound(ball, canvas);

let score = 0;
let lives = 3;

function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    displayScore(ctx, score);
    displayLives(ctx, canvas.width, lives);

    bricks.forEach(b => b.draw());

    paddle.draw();
    ball.draw();

    const brickCollisions = bricks.map(b => b.collisions(ball)).flat();   
    const bricksToRemove = ball.handleCollision(brickCollisions);
    score += bricksToRemove.length;    
    bricks = bricks.filter((v, i, _) =>
        bricksToRemove.some((toRemove, j, _) => v === toRemove) === false);

    const paddleCollisions = paddle.collisions(ball);
    ball.handleCollision(paddleCollisions);
    
    if (bricks.length === 0) {
        win();
    }

    if (outerBound.hasLeftWallCollision() === true) {
        ball.positiveDX();
    }
    else if (outerBound.hasRightWallCollision() === true) {
        ball.negativeDX();
    }
    
    if (outerBound.hasCeilCollision() === true) {
        ball.positiveDY();
    }
    else if (outerBound.hasBottomCollision() === true) {
        if (--lives === 0) {
            gameOver();
        }
        else {
            ball = new Ball(canvas);
            outerBound = new OuterBound(ball, canvas);
        }
    }

    paddle.move();
    ball.move();

    requestAnimationFrame(main);
}

function gameOver() {
    alert("game over");
    document.location.reload();
}

function win() {
    alert("you win!");
    document.location.reload();
}

function displayScore(ctx, score) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function displayLives(ctx, width, lives) {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, width - 65, 20);
}

function intersects(circle, rect) {  
    const cases = [
        new CollisionCandidate(CollisionPosition.left, circle.radius, circle.y, circle.x, rect.x, rect.y, rect.y + rect.height, rect),
        new CollisionCandidate(CollisionPosition.right, circle.radius, circle.y, circle.x, rect.x + rect.width, rect.y, rect.y + rect.height, rect),
        new CollisionCandidate(CollisionPosition.top, circle.radius, circle.x, circle.y, rect.y, rect.x, rect.x + rect.width, rect),
        new CollisionCandidate(CollisionPosition.bottom, circle.radius, circle.x, circle.y, rect.y + rect.height, rect.x, rect.x + rect.width, rect),
    ];
    
    return cases.filter((c, i, _) => { 
        const intersection = getIntersection(c.radius, c.axis1Center, c.axis2Center, c.axis2Coordinate);
        
        const result = intersection === null
            ? false
            : intersection.some((v, j, _) => v >= c.axis1Min && v <= c.axis1Max);

        if (result === true)
            console.log(c.toString());

        return result;
    });

    // intersection of a line (asix2 = asix2Coordinate) with a circle(r, asix1Center, asix2Center)
    function getIntersection(r, asix1Center, asix2Center, asix2Coordinate) {
        const c = r ** 2 - (asix2Coordinate - asix2Center) ** 2;
        if (c < 0) return null;
        return [Math.sqrt(c) + asix1Center, -Math.sqrt(c) + asix1Center];
    }
}

class CollisionPosition {
    static get left() { return 'left'; }
    static get right() { return 'right'; }
    static get top() { return 'top'; }
    static get bottom() { return 'bottom'; }
}

class CollisionCandidate {
    constructor(position,
                radius, 
                axis1Center, 
                axis2Center, 
                axis2Coordinate, 
                axis1Min, 
                axis1Max,
                object) {
        {
            if (position === undefined || position === null) throw new Error(); 
            if (radius === undefined || radius === null) throw new Error(); 
            if (axis1Center === undefined || axis1Center === null) throw new Error(); 
            if (axis2Center === undefined || axis2Center === null) throw new Error(); 
            if (axis2Coordinate === undefined || axis2Coordinate === null) throw new Error(); 
            if (axis1Min === undefined || axis1Min === null) throw new Error(); 
            if (axis1Max === undefined || axis1Max === null) throw new Error(); 
            if (object === undefined || object === null) throw new Error(); 
        }
        this.position = position;
        this.radius = radius;
        this.axis1Center = axis1Center;
        this.axis2Center = axis2Center;
        this.axis2Coordinate = axis2Coordinate;
        this.axis1Min = axis1Min;
        this.axis1Max = axis1Max;
        this.object = object;
    }

    toString() {
        return 'position: ' + this.position +
            ', r: ' + this.radius +
            ', a1c: ' + this.axis1Center +
            ', a2c: ' + this.axis2Center +
            ', a2: ' + this.axis2Coordinate +
            ', a1min: ' + this.axis1Min +
            ', a1max: ' + this.axis1Max; 
    }
}

main();
