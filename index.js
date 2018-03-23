
// TODO: canvas should fit viewport
// This is gonna get reeeeaallly messy!!!


/*====================*\
    #Init Game
\*====================*/

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

let mainCanvas = document.querySelector(".game-canvas");
mainCanvas.width = CANVAS_WIDTH;
mainCanvas.height = CANVAS_HEIGHT;

let lightMapCanvas = document.createElement("canvas");
lightMapCanvas.width = CANVAS_WIDTH;
lightMapCanvas.height = CANVAS_HEIGHT;

let shadowCanvas = document.querySelector(".shadow-canvas");
shadowCanvas.width = CANVAS_WIDTH;
shadowCanvas.height = CANVAS_HEIGHT;

let mainContext = mainCanvas.getContext("2d");
let lightMap = lightMapCanvas.getContext("2d");
let shadowContext = shadowCanvas.getContext("2d");


/* Enemy Vars */
let enemies = [];

/* Player Vars */
let player = createPlayer(mainCanvas);
let stopVal = 0;





/*====================*\
    #Start Game Loop
\*====================*/

setInterval(function () {
    update();
    draw();
}, 100);




function draw() {
    // Clear canvaseses
    mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    lightMap.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    shadowContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);





    /*====================*\
        #Draw Enemies
    \*====================*/

    enemies.forEach(function (enemy) {
        enemy.draw(mainContext);
    });




    /*====================*\
        #Draw Player
    \*====================*/

    player.draw(mainContext);






    /*====================*\
        #Light map
    \*====================*/

    // Turn canvas into mask
    lightMap.globalCompositeOperation = "lighter";

    // Create gradient
    let playerLight = shadowContext.createRadialGradient(player.position.x, player.position.y, 50, player.position.x, player.position.y, 130);
    playerLight.addColorStop(0, "white");
    playerLight.addColorStop(1, "transparent");
    lightMap.fillStyle = playerLight;
    lightMap.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    // Create gradient
    let light2 = shadowContext.createRadialGradient(150, 300, 30, 150, 300, 100);
    light2.addColorStop(0, "white");
    light2.addColorStop(1, "transparent");
    lightMap.fillStyle = light2;
    lightMap.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    // Create gradient
    let light3 = shadowContext.createRadialGradient(650, 300, 30, 650, 300, 100);
    light3.addColorStop(0, "white");
    light3.addColorStop(1, "transparent");
    lightMap.fillStyle = light3;
    lightMap.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    // Create Wave Gradient!!
    let lightWave = shadowContext.createRadialGradient(player.position.x, player.position.y, mainCanvas.width * stopVal / 2, player.position.x, player.position.y, mainCanvas.width * stopVal);
    lightWave.addColorStop(0, "transparent");
    lightWave.addColorStop(stopVal, "white");
    lightWave.addColorStop(1, "transparent");
    lightMap.fillStyle = lightWave;
    lightMap.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

    /*====================*\
        #Create Shadows
    \*====================*/

    shadowContext.globalCompositeOperation = "xor";
    shadowContext.fillStyle = "#000";
    // shadowContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    // shadowContext.drawImage(lightMapCanvas, 0, 0, mainCanvas.width, mainCanvas.height);
}


function update() {

    /*====================*\
        #Update Enemies
    \*====================*/

    enemies.forEach(function (enemy) {
        enemy.update(player);
    });




    /*====================*\
        #Update Player
    \*====================*/
    player.update();
}




/*====================*\
    #Mouse position
\*====================*/
let mousePosition = { x: 0, y: 0 };

document.addEventListener("mousemove", function (e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
});

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
    #Player
\*====================*/

function createPlayer(canvas) {
    let playerImage = new Image();
    playerImage.src = "./imgs/space-ship-svgrepo-com.svg";

    let health = 100;
    let rotation = 0;
    let position = { x: canvas.width / 2, y: canvas.height / 2 };
    let speed = 7;

    let update = function () {
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
        }

    };

    let draw = function (ctx) {
        // Rotate toward the mouse
        let lookVector = {
            x: mousePosition.x - position.x,
            y: mousePosition.y - position.y
        };


        ctx.save();
        ctx.translate(position.x , position.y);
        ctx.rotate(Math.atan2(lookVector.x, -lookVector.y));
        ctx.drawImage(playerImage, -25, -25, 50, 50);
        ctx.restore();

    };


    return {
        health,
        position,
        update,
        draw
    };
};





/*====================*\
    #Spawner
\*====================*/

// Create a new enemy every 3 seconds
setInterval(function () {
    enemies.push(createEnemy(mainCanvas));
}, 3000);

/*====================*\
    #Enemies!
\*====================*/

function createEnemy(canvas) {
    let health = 50;
    let postion = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
    };
    let speed = 5;

    let update = function (player) {
        // how do they move?
        // Walk straight for the player
    };

    let draw = function (ctx) {
        if (health <= 0)
            return;// TODO: remove enemy from memory

        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(postion.x, postion.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    return {
        health,
        speed,
        update,
        draw
    }
};