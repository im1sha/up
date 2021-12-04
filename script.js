const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
var x = canvas.width / 2;
var y = canvas.height - 30;
const dx = 2;
const dy = -2;

setInterval(draw, 1);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();

    ctx.arc(x, y, 10, 0, Math.PI*2);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    
    ctx.closePath();
    
    x += dx;
    y += dy;
}
