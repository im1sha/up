class Ball {
    constructor(canvas, radius, x, y, d) {
        {
            if (canvas === undefined || canvas === null) throw new Error();
            if (radius === undefined || radius === null) throw new Error();
            if (x === undefined || x === null) throw new Error();
            if (y === undefined || y === null) throw new Error();
            if (d === undefined || d === null) throw new Error();
        }

        this._ctx = canvas.getContext("2d");
        this._canvas = canvas;
        this._xRelative = x / canvas.width;
        this._yRelative = y / canvas.height;
        this._dxRelative = d / canvas.width;
        this._dyRelative = -d / canvas.height;
        this._radiusRelative = radius / canvas.width;
    }

    get radius() { return this._radiusRelative * this._canvas.width; }
    get x() { return this._xRelative * this._canvas.width; }
    get y() { return this._yRelative * this._canvas.height; }

    draw() {
        this._ctx.beginPath();
        this._ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        this._ctx.fillStyle = "#aaaacc";
        this._ctx.fill(); 
        this._ctx.closePath();
    }

    move() {
        this._xRelative += this._dxRelative;
        this._yRelative += this._dyRelative;
    }

    positiveDX() {
        this._dxRelative = Math.abs(this._dxRelative);
    }

    negativeDX() {
        this._dxRelative = -Math.abs(this._dxRelative);
    }

    positiveDY() {
        this._dyRelative = Math.abs(this._dyRelative);
    } 
    
    negativeDY() {
        this._dyRelative = -Math.abs(this._dyRelative)
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

    static create(canvas) {
        return new Ball(canvas,
            canvas.height / 40,
            canvas.width / 2,
            canvas.height * 0.8,
            canvas.height / 200);
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
    constructor(canvas, ctx, x, y, width, height, id) {
        {
            if (ctx === undefined || ctx === null) throw new Error(); 
            if (x === undefined || x === null) throw new Error(); 
            if (y === undefined || y === null) throw new Error(); 
            if (width === undefined || width === null) throw new Error(); 
            if (height === undefined || height === null) throw new Error(); 
            if (id === undefined || id === null) throw new Error(); 
            if (canvas === undefined || canvas === null) throw new Error(); 
        }
        this._canvas = canvas;
        this._xRelative = x / canvas.width;
        this._yRelative = y / canvas.height;
        this._widthRelative = width / canvas.width;
        this._heightRelative = height / canvas.height; 
        this._ctx = ctx;
        this._id = id;
    }

    get width() { return this._widthRelative * this._canvas.width; }
    get height() { return this._heightRelative * this._canvas.height; }
    get x() { return this._xRelative * this._canvas.width; }
    get y() { return this._yRelative * this._canvas.height; }
    get id() { return this._id; }

    draw() {
        this._ctx.beginPath();
        this._ctx.rect(this.x, this.y, this.width, this.height);
        this._ctx.fillStyle = "#99cccc";
        this._ctx.fill();
        this._ctx.closePath();
    }

    collisions(ball) {
        return intersects(ball, this);
    }

    static create(canvas, columns, rows, ids) {
        {
            if (canvas === undefined || canvas === null) throw new Error(); 
            if (columns === undefined || columns === null) throw new Error(); 
            if (rows === undefined || rows === null) throw new Error(); 
            if (ids === undefined || ids === null) throw new Error(); 
        }

        const ctx = canvas.getContext("2d");
        const defaultWidth = canvas.width / (columns - 1) / 2;
        const defaultHeight = canvas.height / 2 / rows / 3;
        const topOffset = defaultHeight;
        const leftOffset = defaultWidth / 2;

        return Array.from(
            { length: columns },
            (_, c) => Array.from(
                { length: rows },
                function (_, r) {

                    const id = r * columns + c;
                    if (ids.some((v, j, _) => v === id) === false) return null;

                    return new Brick(
                        canvas,
                        ctx,
                        (c * (defaultWidth + leftOffset)) + leftOffset,
                        (r * (defaultHeight + topOffset)) + topOffset,
                        defaultWidth,
                        defaultHeight,
                        id);
                }))
            .filter((v, i, _) => v !== null)
            .flat();
    } 
}

class Paddle extends Brick {
    constructor(canvas, ctx, x, y, width, height, dx) {
        {
            if (canvas === undefined || canvas === null) throw new Error(); 
        }
        super(canvas, ctx, x, y, width, height, -1);

        this._rightPressed = false;
        this._leftPressed = false;
    
        this._canvas = canvas;
        this._dxRelative = dx / canvas.width;

        this._keydown = e => this.keyDownHandler(e, this);
        this._keyup = e => this.keyUpHandler(e, this);
        this._mousemove = e => this.mouseMoveHandler(e, this);

        document.addEventListener("keydown", this._keydown, false);
        document.addEventListener("keyup", this._keyup, false);
        document.addEventListener("mousemove", this._mousemove, false);

        console.log(x, y, height, width);
    }

    get dx() { return this._dxRelative * this._canvas.width; }
    get x() { return this._xRelative * this._canvas.width; }   
    set x(value) { this._xRelative = value / this._canvas.width; }

    move() {
        if (this._rightPressed === true && this._leftPressed === false) {
            this.x = this.normalizePosition(this, this.x + this.dx);        
        }
        else if (this._leftPressed === true && this._rightPressed === false) {
            this.x = this.normalizePosition(this, this.x - this.dx);        
        }
    }

    mouseMoveHandler(e, paddle) {
        const relativeX = e.clientX - paddle._canvas.offsetLeft;
        paddle.x = paddle.normalizePosition(paddle, relativeX);
    }

    keyDownHandler(e, paddle) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            paddle._rightPressed = true;
        }
        else if (e.key === "Left" || e.key === "ArrowLeft") {
            paddle._leftPressed = true;
        }
    }
    
    keyUpHandler(e, paddle) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            paddle._rightPressed = false;
        }
        else if (e.key === "Left" || e.key === "ArrowLeft") {
            paddle._leftPressed = false;
        }
    }

    normalizePosition(paddle, position) {
        if (position + paddle.width > paddle._canvas.width) {
            return paddle._canvas.width - paddle.width;
        }
        else if (position < 0) {
            return 0;
        }
        else {
            return position;
        } 
    }

    draw() {
        this._ctx.beginPath();
        this._ctx.rect(this.x, this.y, this.width, this.height);
        this._ctx.fillStyle = "#ff6680";
        this._ctx.fill();
        this._ctx.closePath();
    }

    static create(canvas) {
        {
            if (canvas === null || canvas === undefined) throw new Error();
        }

        const ctx = canvas.getContext("2d");
        const defaultWidth = canvas.width / 7;
        const defaultHeight = canvas.height / 30;

        return new Paddle(canvas,
            ctx,
            (canvas.width - defaultWidth) / 2,
            canvas.height - defaultHeight,
            defaultWidth,
            defaultHeight,
            defaultWidth / 5);
    }

    dispose() {
        document.removeEventListener("keydown", this._keydown, false);
        document.removeEventListener("keyup", this._keyup, false);
        document.removeEventListener("mousemove", this._mousemove, false);
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

function main() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    displayScore(ctx, canvas.width, canvas.height, score);
    displayLives(ctx, canvas.width, canvas.height, lives);

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
        return;
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
            return;
        }
        else {
            ball = Ball.create(canvas);
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

function displayScore(ctx, width, height, score) {
    ctx.font = `${(width + height) / 100}px Verdana`;
    ctx.fillStyle = "#534383";
    ctx.fillText("Score: " + score, 0.05 * width, 0.03 * height);
}

function displayLives(ctx, width, height, lives) {
    ctx.font = `${(width + height) / 100}px Verdana`;
    ctx.fillStyle = "#534383";
    ctx.fillText("Lives: " + lives, width * 0.85, 0.03 * height);
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const paddle = Paddle.create(canvas);
let bricks = Brick.create(canvas, 5, 3, [...Array(5 * 3).keys()]);
let ball = Ball.create(canvas);
let outerBound = new OuterBound(ball, canvas);

let score = 0;
let lives = 3;
          
main();
