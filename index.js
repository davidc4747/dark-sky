
// TODO: HUD(totalTime, KillCount, GunHeat, FlashCharge)
// TODO: canvas should fit viewport


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

let hudCanvas = document.createElement("canvas");
hudCanvas.width = CANVAS_WIDTH;
hudCanvas.height = CANVAS_HEIGHT;

let mainContext = mainCanvas.getContext("2d");
let lightMap = lightMapCanvas.getContext("2d");
let shadowContext = shadowCanvas.getContext("2d");




/* Game Vars */
let killCount = 0;
let gameTime = 0;

/* Player Vars */
let player = createPlayer(mainCanvas);

/* Enemy Vars */
let enemies = [];

/* Evironment Vars */
let lights = [
    createRoamingLight(mainCanvas),
    createRoamingLight(mainCanvas)
];

let items = [];





/*====================*\
    #Start Game Loop
\*====================*/

setInterval(function () { gameTime++; }, 1000);
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

    lights.forEach(function (light) {
        light.draw(mainContext, lightMap);
    });

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
        if (enemies[i].getHealth() <= 0) {
            killCount++;
            enemies.splice(i, 1);
        }
        else {
            // console.log("alive?");
            enemies[i].update(player);
            i++;
        }
    }




    /*====================*\
        #Update Player
    \*====================*/

    player.update(enemies);




    /*====================*\
        #Update Evironment
    \*====================*/

    lights.forEach(function (light) {
        light.update();
    });

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

    /* Player Variables */
    let health = 100;
    let rotation = 0;
    let position = { x: canvas.width / 2, y: canvas.height / 2 };
    let speed = 12;

    /* Gun Variables */
    const MAX_GUN_HEAT = 500;
    const GUN_COOL_RATE = 20;
    const GUN_HEAT_RATE = 40;
    const OVERHEAT_PENALTY = 500;
    let bullets = [];
    let gunHeat = 0;

    /* Flash Bang Vars */
    const MAX_FLASH_CHARGE = 3;
    let flashCharges = 1;
    let flashValue = 0;
    let flashPosition = { x: 0, y: 0 };
    let flashAni = TweenLite.to({ flashValue }, 1.2, {
        flashValue: 1,
        ease: Power2.easeIn,
        paused: true,

        onUpdateParams: ["{self}"],
        onUpdate: function (tween) {
            flashValue = tween.target.flashValue
        },

        onComplete: function () {
            flashValue = 0;
        }
    });
    setInterval(function() { if(flashCharges <= MAX_FLASH_CHARGE) flashCharges++; }, 4000);



    let hurt = function (value) {
        health -= value;
    };

    let update = function (enemies) {
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
        if (isKeyDown(" ") && flashCharges > 0 && (flashAni.progress() === 1 || flashAni.progress() === 0)) {
            flashCharges--;
            flashAni.progress(0.15).play();
            flashPosition = {
                x: position.x,
                y: position.y
            };
        }

        // Manage Gun Heat
        gunHeat = (gunHeat - GUN_COOL_RATE > 0) ? gunHeat - GUN_COOL_RATE : 0;
        if (isMouseDown && gunHeat < MAX_GUN_HEAT) {
            gunHeat = gunHeat + GUN_HEAT_RATE;
            bullets.push(createBullet(canvas, position, rotation));

            // If hit the Heat Cap 
            if(gunHeat > MAX_GUN_HEAT){
                // Force disable the gun
                gunHeat += OVERHEAT_PENALTY;
            }
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
            if (bullets[i].isAlive() === false) {
                bullets.splice(i, 1);
                // i--;
            }
            else {
                bullets[i].update(enemies);
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
        let playerLight = shadowContext.createRadialGradient(position.x, position.y, 30, position.x, position.y, 110);
        playerLight.addColorStop(0, "white");
        playerLight.addColorStop(1, "transparent");
        lightContext.fillStyle = playerLight;
        lightContext.fillRect(0, 0, canvas.width, canvas.height);

        // Create Wave Gradient!!
        let lightWave = shadowContext.createRadialGradient(flashPosition.x, flashPosition.y, canvas.width * (flashValue / 1) * 0.25,
            flashPosition.x, flashPosition.y, canvas.width * (flashValue / 1));
        lightWave.addColorStop(0, "transparent");
        lightWave.addColorStop(0.5, "white");
        lightWave.addColorStop(0.8, "white");
        lightWave.addColorStop(1, "transparent");
        lightContext.fillStyle = lightWave;
        lightContext.fillRect(0, 0, canvas.width, canvas.height);
    };


    return {
        getHealth: function () {
            return health;
        },
        position,
        hurt,
        update,
        draw
    };
};

/*====================*\
    #Bullet
\*====================*/

function createBullet(canvas, playerPos, playerRotation) {// NOTE: pass canvas, gameObj
    const MAX_BULLET_DIS = 300;
    const BULLET_HEIGHT = 35;
    const HIT_RADIUS = 35;
    const BULLET_DAMAGE = 11;

    let isAlive = true;
    let disTraveled = 0;
    let position = { x: playerPos.x, y: playerPos.y };
    let rotation = playerRotation - (Math.PI / 2) + (Math.random() * (Math.PI / 8)) - (Math.PI / 16);
    let speed = 30;

    // Calc the direction the bullet is moving towards
    let lookVector = {
        x: Math.cos(rotation),
        y: Math.sin(rotation)
    };


    let update = function (enemies) {
        if (!isAlive) return;

        // Move the bullet
        position.x += lookVector.x * speed;// NOTE: this isn't exactly right
        position.y += lookVector.y * speed;

        // Check for collision with enemies
        enemies.forEach(function (enemy) {
            let vectorToEnemy = {
                x: enemy.position.x - position.x,
                y: enemy.position.y - position.y
            };
            let enemyDis = Math.sqrt(Math.pow(vectorToEnemy.x, 2) + Math.pow(vectorToEnemy.y, 2));

            // bullet is active, and hits an enemy
            if (isAlive === true && enemyDis <= HIT_RADIUS) {
                enemy.hurt(BULLET_DAMAGE);
                isAlive = false;
            }
        });

        // Remove bullet after set distance
        disTraveled += speed;
        isAlive = isAlive && disTraveled <= MAX_BULLET_DIS;
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
        lightContext.arc(-BULLET_HEIGHT / 2, 0, BULLET_HEIGHT, 0, 2 * Math.PI);
        lightContext.fill();

        lightContext.restore();
    };

    return {
        isAlive: function () {
            return isAlive;
        },
        position,
        update,
        draw
    };
}





/*====================*\
    #Enemy Spawner
\*====================*/
const BASE_SPAWN_TIME = 4300;
setTimeout(spawnEnemy, BASE_SPAWN_TIME);
function spawnEnemy() {
    enemies.push(createEnemy(mainCanvas, player.position));

    // Spawn Next enemy
    let nextSpawnTime = Math.max(BASE_SPAWN_TIME - (Math.pow(gameTime, 1.4)), 1500);
    setTimeout(spawnEnemy, nextSpawnTime);
}

/*====================*\
    #Enemies!
\*====================*/

function createEnemy(canvas, playerPos) {
    const MAX_HEALTH = 80;
    const HIT_RADIUS = 30;

    let health = MAX_HEALTH;
    let speed = 7;

    let spawnDis = (1 * canvas.width * 0.45) + (canvas.width * 0.2);
    let spawnRotation = Math.random() * Math.PI * 2;
    let position = {
        x: playerPos.x + (spawnDis * Math.cos(spawnRotation)),
        y: playerPos.y + (spawnDis * Math.sin(spawnRotation))
    };



    let hurt = function (value) {
        health -= value;
    };

    let update = function (player) {
        if (health <= 0) return;
        let vectorToPlayer = {
            x: player.position.x - position.x,
            y: player.position.y - position.y
        };
        let playerDis = Math.sqrt(Math.pow(vectorToPlayer.x, 2) + Math.pow(vectorToPlayer.y, 2));

        // Walk straight for the player
        let lookVector = {
            x: vectorToPlayer.x / playerDis,
            y: vectorToPlayer.y / playerDis
        };

        position.x += lookVector.x * speed;
        position.y += lookVector.y * speed;

        // Check for collision with player
        if (health > 0 && playerDis <= HIT_RADIUS) {
            player.hurt(10);
            health = -1;
        }
    };

    let draw = function (ctx) {
        if (health <= 0) return;

        // Draw the Shape
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.fillStyle = "red";
        ctx.lineWidth = 4;
        ctx.arc(position.x, position.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        // Draw the healthBar        
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 5;
        ctx.arc(position.x, position.y, 10, 0, (health / MAX_HEALTH) * (2 * Math.PI));
        ctx.stroke();
    };

    return {
        getHealth: function () {
            return health;
        },
        position,
        hurt,
        update,
        draw
    }
};





/*====================*\
    #Roaming Light
\*====================*/

function createRoamingLight(canvas) {
    let position = { x: 0, y: 0 };
    let radius = 0;

    let breathAni;
    setTimeout(function () { show(); }, Math.random() * 10000);


    let hide = function () {
        // Hide Light for 4 to 15 seconds
        let hideTime = (Math.random() * 11000) + 4000;
        setTimeout(function () { show(); }, hideTime);

        // Opening animation in reverse, Play closing animation
        let openAni = TweenLite.from({ radius }, 1, {
            radius: 0,
            ease: Power2.easeIn,
            paused: true,

            onUpdateParams: ["{self}"],
            onUpdate: function (tween) {
                radius = tween.target.radius
            },

            onComplete: function () {
                // Stop the Breathing animation
                breathAni.pause(0);
            }
        });
        openAni.progress(1).reverse();
    };

    let show = function () {
        // Randomly set position
        position = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };

        // Show Light for 4 to 14 seconds
        let showTime = (Math.random() * 11000) + 4000;
        setTimeout(function () { hide(); }, showTime);

        // Play Open animation
        let openAni = TweenLite.to({ radius }, 0.8, {
            radius: (1 * canvas.width * 0.14) + (canvas.width * 0.07),
            ease: Power2.easeIn,
            paused: true,

            onUpdateParams: ["{self}"],
            onUpdate: function (tween) {
                radius = tween.target.radius
            },

            onComplete: function () {
                // Play breathing animation
                breathAni = TweenMax.to({ radius }, 1.5, {
                    radius: "+=" + (canvas.width * 0.015),
                    yoyo: true,
                    repeat: -1,
                    ease: Sine.easeInOut,

                    onUpdateParams: ["{self}"],
                    onUpdate: function (tween) {
                        radius = tween.target.radius
                    }
                });
            }
        });
        openAni.play();
    };



    let update = function () {
        // NOTE: all logic is handled throught timeouts inside "show()" and "hide()"
    };

    let draw = function (ctx, lightContext) {
        // Create gradient
        let light = lightContext.createRadialGradient(position.x, position.y, radius * 0.15, position.x, position.y, radius);
        light.addColorStop(0, "white");
        light.addColorStop(1, "transparent");
        lightContext.fillStyle = light;
        lightContext.fillRect(0, 0, canvas.width, canvas.height);
    };


    return {
        update,
        draw
    };
}