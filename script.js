/* ESSENTIAL FUNCTIONS */

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

// Run on initial load
resizeCanvas();

//Update size if the user resizes the browser window
window.addEventListener("resize", resizeCanvas);

/* END INITIALIZE CODE */

// DRAWING LOGIC

function draw() {
    // canvas background
    ctx.fillStyle = "white";
    
    // FIXED: Swapped canvas.height and canvas.width back to their correct positions (X, Y, Width, Height)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // player
    ctx.fillStyle = "red";
    ctx.fillRect(10, 10, 25, 25);
}

/* HOME SCREEN CODE*/

/* END HOME SCREEN CODE */
