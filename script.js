
/* =========================================
   EXPLORE-WORLD RPG
   MOVEMENT + CAMERA SYSTEM
========================================= */


/* =========================================
   CONFIGURATION
========================================= */

const CONFIG = {
    // Map image location
    mapImage: "assets/images/test world/pixil-frame-0.png",

    // Fallback map dimensions if image fails to load
    fallbackMapWidth: 1024,
    fallbackMapHeight: 1024,

    // Player settings
    playerSize: 25,
    startingX: 50,
    startingY: 50,

    // Movement speed in pixels per second
    startingSpeed: 240,
    minimumSpeed: 60,
    maximumSpeed: 600,
    speedChange: 30,

    // Camera smoothing
    cameraSmoothness: 8
};


/* =========================================
   ESSENTIAL FUNCTIONS
========================================= */

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


/* =========================================
   CANVAS INITIALIZATION
========================================= */

const canvas = document.getElementById("homeScreen");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


/* =========================================
   MAP INITIALIZATION
========================================= */

const mapImage = new Image();

const world = {
    width: CONFIG.fallbackMapWidth,
    height: CONFIG.fallbackMapHeight,
    loaded: false
};

mapImage.onload = function () {
    world.width = mapImage.naturalWidth;
    world.height = mapImage.naturalHeight;
    world.loaded = true;

    clampPlayerToWorld();
    clampCameraToWorld();
};

mapImage.onerror = function () {
    console.warn("Map image could not be loaded:", CONFIG.mapImage);
};

mapImage.src = CONFIG.mapImage;


/* =========================================
   PLAYER
========================================= */

const player = {
    x: CONFIG.startingX,
    y: CONFIG.startingY,
    size: CONFIG.playerSize,
    speed: CONFIG.startingSpeed
};


/* =========================================
   CAMERA
========================================= */

const camera = {
    x: 0,
    y: 0,

    // true = follows player
    // false = remains stationary
    locked: true
};


/* =========================================
   KEYBOARD INPUT
========================================= */

const keys = {
    w: false,
    a: false,
    s: false,
    d: false,

    arrowup: false,
    arrowleft: false,
    arrowdown: false,
    arrowright: false
};


/* =========================================
   WORLD BOUNDARIES
========================================= */

function clampPlayerToWorld() {
    player.x = clamp(
        player.x,
        0,
        world.width - player.size
    );

    player.y = clamp(
        player.y,
        0,
        world.height - player.size
    );
}


function clampCameraToWorld() {
    const maxCameraX = Math.max(0, world.width - canvas.width);
    const maxCameraY = Math.max(0, world.height - canvas.height);

    camera.x = clamp(camera.x, 0, maxCameraX);
    camera.y = clamp(camera.y, 0, maxCameraY);
}


/* =========================================
   MOVEMENT SYSTEM
========================================= */

function updateMovement(deltaTime) {
    let moveX = 0;
    let moveY = 0;

    if (keys.w || keys.arrowup) moveY -= 1;
    if (keys.s || keys.arrowdown) moveY += 1;

    if (keys.a || keys.arrowleft) moveX -= 1;
    if (keys.d || keys.arrowright) moveX += 1;

    // Normalize diagonal movement
    if (moveX !== 0 || moveY !== 0) {
        const length = Math.hypot(moveX, moveY);

        moveX /= length;
        moveY /= length;

        // Frame-rate independent movement
        const distance = player.speed * deltaTime;

        player.x += moveX * distance;
        player.y += moveY * distance;
    }

    clampPlayerToWorld();
}


/* =========================================
   CAMERA FOLLOW SYSTEM
========================================= */

function updateCamera(deltaTime) {

    // Unlocked camera does not move
    if (!camera.locked) {
        return;
    }

    // Calculate where the camera wants to be
    const targetX =
        player.x + player.size / 2 - canvas.width / 2;

    const targetY =
        player.y + player.size / 2 - canvas.height / 2;

    // Smooth camera movement
    const smoothing = 1 - Math.exp(
        -CONFIG.cameraSmoothness * deltaTime
    );

    camera.x += (targetX - camera.x) * smoothing;
    camera.y += (targetY - camera.y) * smoothing;

    // Prevent camera from leaving the map
    clampCameraToWorld();
}


/* =========================================
   DRAWING SYSTEM
========================================= */

function drawMap() {
    if (world.loaded) {
        ctx.drawImage(
            mapImage,
            0,
            0,
            world.width,
            world.height
        );
    } else {
        // Temporary background while map loads
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, world.width, world.height);
    }
}


function drawPlayer() {
    ctx.fillStyle = "red";

    ctx.fillRect(
        player.x,
        player.y,
        player.size,
        player.size
    );
}


function drawHUD() {
    // HUD is drawn in screen coordinates
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(12, 12, 230, 100);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";

    ctx.fillText(
        "Camera: " + (camera.locked ? "LOCKED" : "UNLOCKED"),
        24,
        35
    );

    ctx.fillText(
        "Speed: " + player.speed + " px/s",
        24,
        58
    );

    ctx.fillText(
        "C: Toggle camera",
        24,
        82
    );

    ctx.fillText(
        "+ / -: Change speed",
        24,
        102
    );
}


function draw() {
    // Clear the screen
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera offset
    ctx.save();

    ctx.translate(-camera.x, -camera.y);

    drawMap();
    drawPlayer();

    ctx.restore();

    // Draw HUD independently of camera
    drawHUD();
}


/* =========================================
   SPEED CONTROLS
========================================= */

function increaseSpeed() {
    player.speed = Math.min(
        player.speed + CONFIG.speedChange,
        CONFIG.maximumSpeed
    );
}


function decreaseSpeed() {
    player.speed = Math.max(
        player.speed - CONFIG.speedChange,
        CONFIG.minimumSpeed
    );
}


/* =========================================
   KEYBOARD EVENTS
========================================= */

window.addEventListener("keydown", function (event) {
    const key = event.key.toLowerCase();

    // Prevent browser scrolling and zooming
    if (
        key in keys ||
        key === " " ||
        key === "+" ||
        key === "=" ||
        key === "-"
    ) {
        event.preventDefault();
    }

    // Movement keys
    if (key in keys) {
        keys[key] = true;
    }

    // Camera toggle
    if (key === "c" && !event.repeat) {
        camera.locked = !camera.locked;
    }

    // Increase speed
    if (
        (key === "+" || key === "=") &&
        !event.repeat
    ) {
        increaseSpeed();
    }

    // Decrease speed
    if (key === "-" && !event.repeat) {
        decreaseSpeed();
    }
});


window.addEventListener("keyup", function (event) {
    const key = event.key.toLowerCase();

    if (key in keys) {
        keys[key] = false;
    }
});


/* =========================================
   GAME LOOP
========================================= */

let previousTime = 0;

function update(currentTime) {

    if (previousTime === 0) {
        previousTime = currentTime;
    }

    // Calculate elapsed time in seconds
    const deltaTime = Math.min(
        (currentTime - previousTime) / 1000,
        0.05
    );

    previousTime = currentTime;

    updateMovement(deltaTime);
    updateCamera(deltaTime);

    draw();

    requestAnimationFrame(update);
}


/* =========================================
   START GAME
========================================= */

resizeCanvas();

window.addEventListener("resize", function () {
    resizeCanvas();
    clampCameraToWorld();
});

requestAnimationFrame(update);
