
// TODO: canvas should fit viewport


/*====================*\
    #Init Canvas
\*====================*/

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

let canvas = document.querySelector("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let ctx = canvas.getContext("2d");

let position = { x: 0, y: 0 };
let speed = 5;





/*====================*\
    #Start Game Loop
\*====================*/

setInterval(function () {
    update();
    draw();
}, 100);
// draw();




function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient
    let grd = ctx.createRadialGradient(position.x, position.y, 5, 90, 60, 100);// how the hell does this work??
    grd.addColorStop(0, "transparent");
    grd.addColorStop(1, "black");

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function update() {
    // Check for keyboard input
    if (isKeyDown("w")) {
        position.y -= speed;
    }
    if (isKeyDown("a")) {
        position.x -= speed;
    }
    if (isKeyDown("s")) {
        position.y += speed;
    }
    if (isKeyDown("d")) {
        position.x += speed;
    }
}








/*====================*\
    #Muli-KeyPress
\*====================*/

// TODO: Move key detection into it's own module
// Create a Map of key states to allow detection of multiple KeyPresses

let keyMap = {};
let keyCheck = function (e) {
    keyMap[e.key.toLowerCase()] = e.type === "keydown";
};
document.addEventListener("keydown", keyCheck);
document.addEventListener("keyup", keyCheck);

function isKeyDown(key) {
    return keyMap[key.toLowerCase()];
}