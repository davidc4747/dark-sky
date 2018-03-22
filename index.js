
// TODO: canvas should fit viewport
// This is gonna get reeeeaallly messy...


/*====================*\
    #Init Canvas
\*====================*/

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

let canvas = document.querySelector(".game-canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let lightMapCanvas = document.createElement("canvas");
lightMapCanvas.width = CANVAS_WIDTH;
lightMapCanvas.height = CANVAS_HEIGHT;

let shadowCanvas = document.querySelector(".shadow-canvas");
shadowCanvas.width = CANVAS_WIDTH;
shadowCanvas.height = CANVAS_HEIGHT;

let mainContext = canvas.getContext("2d");
let lightMap = lightMapCanvas.getContext("2d");
let shadowContext = shadowCanvas.getContext("2d");




/* Player Vars */
let position = { x: canvas.width / 2, y: canvas.height / 2 };
let speed = 7;
let stopVal = 0;





/*====================*\
    #Start Game Loop
\*====================*/

setInterval(function () {
    update();
    draw();
}, 100);
// draw();




function draw() {
    // Clear canvaseses
    mainContext.clearRect(0, 0, canvas.width, canvas.height);
    lightMap.clearRect(0, 0, canvas.width, canvas.height);
    shadowContext.clearRect(0, 0, canvas.width, canvas.height);




    /*====================*\
        #Draw Player
    \*====================*/

    let playerImage = new Image();
    playerImage.src = "./imgs/space-ship-svgrepo-com.svg"
    mainContext.drawImage(playerImage, position.x, position.y, 64, 64);






    /*====================*\
        #Light map
    \*====================*/

    // Turn canvas into mask
    lightMap.globalCompositeOperation = "lighter";

    // Create gradient
    let playerLight = shadowContext.createRadialGradient(position.x, position.y, 50, position.x, position.y, 130);
    playerLight.addColorStop(0, "white");
    playerLight.addColorStop(1, "transparent");
    lightMap.fillStyle = playerLight;
    lightMap.fillRect(0, 0, canvas.width, canvas.height);

    // Create gradient
    let light2 = shadowContext.createRadialGradient(150, 300, 30, 150, 300, 100);
    light2.addColorStop(0, "white");
    light2.addColorStop(1, "transparent");
    lightMap.fillStyle = light2;
    lightMap.fillRect(0, 0, canvas.width, canvas.height);

    // Create gradient
    let light3 = shadowContext.createRadialGradient(650, 300, 30, 650, 300, 100);
    light3.addColorStop(0, "white");
    light3.addColorStop(1, "transparent");
    lightMap.fillStyle = light3;
    lightMap.fillRect(0, 0, canvas.width, canvas.height);

    // Create Wave Gradient!!
    let lightWave = shadowContext.createRadialGradient(position.x, position.y, canvas.width * stopVal / 2, position.x, position.y, canvas.width * stopVal);
    lightWave.addColorStop(0, "transparent");
    lightWave.addColorStop(stopVal, "white");
    lightWave.addColorStop(1, "transparent");
    lightMap.fillStyle = lightWave;
    lightMap.fillRect(0, 0, canvas.width, canvas.height);

    /*====================*\
        #Create Shadows
    \*====================*/

    shadowContext.globalCompositeOperation = "xor";
    shadowContext.fillStyle = "#000";
    shadowContext.fillRect(0, 0, canvas.width, canvas.height);
    shadowContext.drawImage(lightMapCanvas, 0, 0, canvas.width, canvas.height);
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


    // FOR TESTING!!!!
    if (isKeyDown(" ")) {
        stopVal = (stopVal + 0.1) % 1;
        console.log("space is Down!!", stopVal);// <.<

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





/*====================*\
    #Muli-KeyPress
\*====================*/