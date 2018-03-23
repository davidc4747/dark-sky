
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
        enemy.draw(mainContext, lightMap);
    });




    /*====================*\
        #Draw Player
    \*====================*/

    player.draw(mainContext, lightMap);






    /*====================*\
        #Light map
    \*====================*/

    // Turn canvas into mask
    lightMap.globalCompositeOperation = "lighter";

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
    shadowContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    shadowContext.drawImage(lightMapCanvas, 0, 0, mainCanvas.width, mainCanvas.height);
}


function update() {

    /*====================*\
        #Update Enemies
    \*====================*/

    let i = 0;
    while (i < enemies.length) {
        // Remove inactive enemies
        if (enemies[i].health <= 0) {
            enemies.splice(i, 1);
            i--;
        }
        else {
            enemies[i].update();
            i++;
        }
    }




    /*====================*\
        #Update Player
    \*====================*/
    player.update();
}




/*====================*\
    #Mouse position
\*====================*/
let isMouseDown = false;
let mousePosition = { x: 0, y: 0 };

document.addEventListener("mousemove", function (e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
});

document.addEventListener("mousedown", function (e) {
    isMouseDown = true;
});

document.addEventListener("mouseup", function (e) {
    isMouseDown = false;
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

    let bullets = [];

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


        // Light Bomb
        if (isKeyDown(" ")) {
            stopVal = (stopVal + 0.1) % 1;
        }

        if (isMouseDown) {
            bullets.push(createBullet(canvas, position, rotation));
        }

        // Rotate toward the mouse
        let lookVector = {
            x: mousePosition.x - position.x,
            y: mousePosition.y - position.y
        };
        rotation = Math.atan2(lookVector.x, -lookVector.y);

        // Update Bullets
        let i = 0;
        while (i < bullets.length) {
            // Remove inactive bullets
            if (bullets[i].isAlive === false) {
                bullets.splice(i, 1);
                i--;
            }
            else {
                bullets[i].update();
                i++;
            }
        }

    };

    let draw = function (ctx, lightContext) {
        // Draw Bullets
        bullets.forEach(function (bullet) {
            bullet.draw(ctx, lightContext);
        });

        // Draw the player
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(rotation);
        ctx.drawImage(playerImage, -25, -25, 50, 50);
        ctx.restore();

        // Draw Player Light
        let playerLight = shadowContext.createRadialGradient(position.x, position.y, 30, position.x, position.y, 50);
        playerLight.addColorStop(0, "white");
        playerLight.addColorStop(1, "transparent");
        lightContext.fillStyle = playerLight;
        lightContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    };


    return {
        health,
        position,
        update,
        draw
    };
};

/*====================*\
    #Bullet
\*====================*/

function createBullet(canvas, playerPos, playerRotation) {
    const MAX_BULLET_DIS = 300;
    const BULLET_HEIGHT = 35;

    let isAlive = true;
    let disTraveled = 0;
    let position = { x: playerPos.x, y: playerPos.y };
    let rotation = playerRotation - (Math.PI / 2) + (Math.random() * (Math.PI / 8)) - (Math.PI / 16);
    let speed = 35;

    // Calc the direction the bullet is moving towards
    let lookVector = {
        x: Math.cos(rotation),
        y: Math.sin(rotation)
    };


    let update = function () {
        if (!isAlive) return;

        // Move the bullet
        position.x += lookVector.x * speed;
        position.y += lookVector.y * speed;

        // Check for collition with enemies

        // Remove bullet after set distance
        disTraveled += speed;
        isAlive = disTraveled <= MAX_BULLET_DIS;
    };

    let draw = function (ctx, lightContext) {
        if (!isAlive) return;

        // Draw the bullet
        let lineEnd = {
            x: position.x + lookVector.x * BULLET_HEIGHT,
            y: position.y + lookVector.y * BULLET_HEIGHT
        };
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.moveTo(position.x, position.y);
        ctx.lineTo(lineEnd.x, lineEnd.y);
        ctx.stroke();

        // Draw the light around it
        let glow = shadowContext.createRadialGradient(0, 0, 1, 0, 0, BULLET_HEIGHT);
        glow.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        glow.addColorStop(1, "transparent");

        lightContext.save();
        lightContext.translate(lineEnd.x, lineEnd.y);
        lightContext.rotate(rotation);

        lightContext.lineWidth = 0;
        lightContext.fillStyle = glow;
        lightContext.scale(1.8, 0.7);

        lightContext.beginPath();
        lightContext.arc(-BULLET_HEIGHT/2, 0, BULLET_HEIGHT, 0, 2 * Math.PI);
        lightContext.fill();

        lightContext.restore();
    };

    return {
        isAlive,
        position,
        update,
        draw
    };
}





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
    let position = {
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
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(position.x, position.y, 10, 0, 2 * Math.PI);
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