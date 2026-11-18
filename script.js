
/* =========================================
   EXPLORE-WORLD RPG
   CONSTANT FOLLOW CAMERA
========================================= */


/* CONFIGURATION */

const CONFIG = {
    mapImage: "assets/images/test-world.png",

    zoom: 10,

    playerSize: 6,

    startingSpeed: 100,
    minimumSpeed: 10,
    maximumSpeed: 1000,
    speedChange: 10
};


/* CANVAS */

const canvas = document.getElementById("homeScreen");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


/* WORLD */

const mapImage = new Image();

const world = {
    width: 1024,
    height: 1024,
    loaded: false
};


/* PLAYER */

const player = {
    x: 0,
    y: 0,
    size: CONFIG.playerSize,
    speed: CONFIG.startingSpeed
};


mapImage.onload = function () {
    world.width = mapImage.naturalWidth;
    world.height = mapImage.naturalHeight;

    world.loaded = true;

    player.x = (world.width - player.size) / 2;
    player.y = (world.height - player.size) / 2;

    updateCamera();
};

mapImage.onerror = function () {
    console.error("Map image failed to load:", CONFIG.mapImage);
};

mapImage.src = CONFIG.mapImage;


/* CAMERA */

const camera = {
    x: 0,
    y: 0
};

const zoom = CONFIG.zoom;


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


/* CAMERA DIMENSIONS */

function getVisibleWorldWidth() {
    return canvas.width / zoom;
}

function getVisibleWorldHeight() {
    return canvas.height / zoom;
}


/* WORLD BOUNDARIES */

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function clampPlayer() {
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


/* CONSTANT CAMERA FOLLOW */

function updateCamera() {
    if (!world.loaded) return;

    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    const visibleWidth = getVisibleWorldWidth();
    const visibleHeight = getVisibleWorldHeight();

    const desiredX = playerCenterX - visibleWidth / 2;
    const desiredY = playerCenterY - visibleHeight / 2;

    camera.x = clamp(
        desiredX,
        0,
        Math.max(0, world.width - visibleWidth)
    );

    camera.y = clamp(
        desiredY,
        0,
        Math.max(0, world.height - visibleHeight)
    );
}


/* PLAYER MOVEMENT */

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


/* DRAW MAP */

function drawMap() {
    if (!world.loaded) return;

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
        mapImage,
        0,
        0,
        world.width,
        world.height
    );
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
    ctx.fillRect(12, 12, 230, 85);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";

    ctx.fillText("Camera: ALWAYS FOLLOWING", 24, 35);
    ctx.fillText("Speed: " + player.speed + " px/s", 24, 58);
    ctx.fillText("P: Set custom speed", 24, 82);
}


/* MAIN DRAW FUNCTION */

function draw() {
    // Reset canvas transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (world.loaded) {
        // Apply zoom and camera position
        ctx.setTransform(
            zoom,
            0,
            0,
            zoom,
            -camera.x * zoom,
            -camera.y * zoom
        );

        drawMap();
        drawPlayer();
    }

    // Draw HUD independently of camera
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


/* CUSTOM SPEED PROMPT */

function setCustomSpeed() {
    const input = prompt(
        "Enter your new movement speed (10–1000 px/s):",
        player.speed
    );

    if (input === null) return;

    const newSpeed = Number(input);

    if (
        input.trim() === "" ||
        !Number.isFinite(newSpeed) ||
        newSpeed < CONFIG.minimumSpeed ||
        newSpeed > CONFIG.maximumSpeed
    ) {
        alert(
            "Invalid speed! Enter a number between " +
            CONFIG.minimumSpeed + " and " +
            CONFIG.maximumSpeed + "."
        );

        return;
    }

    player.speed = newSpeed;
}


/* KEYBOARD EVENTS */

window.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    if (
        key in keys ||
        key === "+" ||
        key === "=" ||
        key === "-" ||
        key === "p"
    ) {
        event.preventDefault();
    }

    if (key in keys) {
        keys[key] = true;
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

    if (key === "p" && !event.repeat) {
        setCustomSpeed();
    }
});


window.addEventListener("keyup", function(event) {
    const key = event.key.toLowerCase();

    if (key in keys) {
        keys[key] = false;
    }
});


/* PREVENT STUCK MOVEMENT KEYS */

window.addEventListener("blur", function() {
    for (const key in keys) {
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

window.addEventListener("resize", function() {
    resizeCanvas();
    updateCamera();
});

requestAnimationFrame(update);
