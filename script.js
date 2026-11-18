
/* =========================================
   EXPLORE-WORLD RPG
   CAMERA + MOVEMENT SYSTEM V2
========================================= */


/* CONFIGURATION */

const CONFIG = {
    mapImage: "assets/images/test-world.png",

    playerSize: 25,

    startingSpeed: 180,
    minimumSpeed: 60,
    maximumSpeed: 600,
    speedChange: 30,

    // Minimum visual map scale.
    // Each 32px checkerboard square becomes 72px.
    minimumZoom: 2.25,

    // Gives the camera some room to scroll
    mapOverscan: 1.2
};


/* CANVAS */

const canvas = document.getElementById("homeScreen");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    calculateZoom();
    clampCamera();
}


/* WORLD */

const mapImage = new Image();

const world = {
    width: 1024,
    height: 1024,
    loaded: false
};

let zoom = CONFIG.minimumZoom;

mapImage.onload = function () {
    world.width = mapImage.naturalWidth;
    world.height = mapImage.naturalHeight;
    world.loaded = true;

    // Start player in map center
    player.x = (world.width - player.size) / 2;
    player.y = (world.height - player.size) / 2;

    calculateZoom();
    updateCamera();
};

mapImage.onerror = function () {
    console.error("Unable to load test world image:", CONFIG.mapImage);
};

mapImage.src = CONFIG.mapImage;


/* PLAYER */

const player = {
    x: 0,
    y: 0,
    size: CONFIG.playerSize,
    speed: CONFIG.startingSpeed
};


/* CAMERA */

const camera = {
    x: 0,
    y: 0,
    locked: true
};


/* INPUT */

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


/* ZOOM CALCULATION */

function calculateZoom() {
    if (!world.loaded) return;

    const widthZoom =
        (canvas.width / world.width) * CONFIG.mapOverscan;

    const heightZoom =
        (canvas.height / world.height) * CONFIG.mapOverscan;

    zoom = Math.max(
        CONFIG.minimumZoom,
        widthZoom,
        heightZoom
    );
}


/* CAMERA BOUNDARIES */

function getVisibleWorldWidth() {
    return canvas.width / zoom;
}

function getVisibleWorldHeight() {
    return canvas.height / zoom;
}

function clampCamera() {
    const maxX = Math.max(
        0,
        world.width - getVisibleWorldWidth()
    );

    const maxY = Math.max(
        0,
        world.height - getVisibleWorldHeight()
    );

    camera.x = Math.max(0, Math.min(camera.x, maxX));
    camera.y = Math.max(0, Math.min(camera.y, maxY));
}

function clampPlayer() {
    player.x = Math.max(
        0,
        Math.min(player.x, world.width - player.size)
    );

    player.y = Math.max(
        0,
        Math.min(player.y, world.height - player.size)
    );
}


/* MOVEMENT */

function updateMovement(deltaTime) {
    let moveX = 0;
    let moveY = 0;

    if (keys.w || keys.arrowup) moveY--;
    if (keys.s || keys.arrowdown) moveY++;

    if (keys.a || keys.arrowleft) moveX--;
    if (keys.d || keys.arrowright) moveX++;

    if (moveX !== 0 || moveY !== 0) {
        const length = Math.hypot(moveX, moveY);

        moveX /= length;
        moveY /= length;

        const distance = player.speed * deltaTime;

        player.x += moveX * distance;
        player.y += moveY * distance;
    }

    clampPlayer();
}


/* CAMERA FOLLOW */

function updateCamera() {
    if (!camera.locked) return;

    // Exact player center
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    // Camera centers player
    camera.x = playerCenterX - getVisibleWorldWidth() / 2;
    camera.y = playerCenterY - getVisibleWorldHeight() / 2;

    // Stop camera at world boundaries
    clampCamera();
}


/* DRAW MAP */

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
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, world.width, world.height);
    }
}


/* DRAW PLAYER */

function drawPlayer() {
    ctx.fillStyle = "red";

    ctx.fillRect(
        player.x,
        player.y,
        player.size,
        player.size
    );
}


/* HUD */

function drawHUD() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(12, 12, 230, 105);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";

    ctx.fillText(
        "Camera: " + (camera.locked ? "LOCKED" : "UNLOCKED"),
        24, 35
    );

    ctx.fillText(
        "Speed: " + player.speed + " px/s",
        24, 58
    );

    ctx.fillText("C: Toggle camera", 24, 82);
    ctx.fillText("+ / -: Change speed", 24, 102);
}


/* RENDERING */

function draw() {
    // Reset transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and camera position
    ctx.setTransform(
        zoom,
        0,
        0,
        zoom,
        -camera.x * zoom,
        -camera.y * zoom
    );

    ctx.imageSmoothingEnabled = false;

    drawMap();
    drawPlayer();

    // HUD stays in screen coordinates
    drawHUD();
}


/* SPEED CONTROLS */

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


/* KEYBOARD EVENTS */

window.addEventListener("keydown", function (event) {
    const key = event.key.toLowerCase();

    if (
        key in keys ||
        key === "+" ||
        key === "=" ||
        key === "-"
    ) {
        event.preventDefault();
    }

    if (key in keys) {
        keys[key] = true;
    }

    if (key === "c" && !event.repeat) {
        camera.locked = !camera.locked;
    }

    if (
        (key === "+" || key === "=") &&
        !event.repeat
    ) {
        increaseSpeed();
    }

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


/* GAME LOOP */

let previousTime = 0;

function update(currentTime) {
    if (previousTime === 0) {
        previousTime = currentTime;
    }

    const deltaTime = Math.min(
        (currentTime - previousTime) / 1000,
        0.05
    );

    previousTime = currentTime;

    updateMovement(deltaTime);
    updateCamera();
    draw();

    requestAnimationFrame(update);
}


/* INITIALIZATION */

resizeCanvas();

window.addEventListener("resize", function () {
    resizeCanvas();
    updateCamera();
});

requestAnimationFrame(update);
