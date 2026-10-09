/* ESSENTIAL FUNCTIONS */

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// MAKE CANVAS WHOLE SCREEN
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

/* END ESSENTIAL FUNCTIONS */

/* INITIALIZE CODE */

// GET CONTEXT OF CANVAS (VERY IMPORTANT)
const canvas = document.getElementById('homeScreen');
const ctx = canvas.getContext('2d');

const player = {
    x: 50,
    y: 50,
    size: 25,
    speed: 5
};

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

// Run on initial load
resizeCanvas();

// Update size if the user resizes the browser window
window.addEventListener("resize", resizeCanvas);

/* END INITIALIZE CODE */

// DRAWING LOGIC
function draw() {
    // canvas background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* PLAYER */
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.size, player.size);
    /* END PLAYER */
}

function update() {
    let moveX = 0;
    let moveY = 0;

    if (keys.w || keys.arrowup) moveY -= 1;
    if (keys.s || keys.arrowdown) moveY += 1;
    if (keys.a || keys.arrowleft) moveX -= 1;
    if (keys.d || keys.arrowright) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
        const length = Math.hypot(moveX, moveY);
        const normalizedX = moveX / length;
        const normalizedY = moveY / length;

        player.x += normalizedX * player.speed;
        player.y += normalizedY * player.speed;
    }

    player.x = clamp(player.x, 0, canvas.width - player.size);
    player.y = clamp(player.y, 0, canvas.height - player.size);

    draw();
    requestAnimationFrame(update);
}

/* HOME SCREEN CODE*/
window.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    if (key === "w" || key === "a" || key === "s" || key === "d" ||
        key === "arrowup" || key === "arrowleft" || key === "arrowdown" || key === "arrowright") {
        event.preventDefault();
    }

    if (key in keys) {
        keys[key] = true;
    }
});

window.addEventListener("keyup", function(event) {
    const key = event.key.toLowerCase();

    if (key in keys) {
        keys[key] = false;
    }
});

requestAnimationFrame(update);
/* END HOME SCREEN CODE */
