/* HOME SCREEN CODE*/

const canvas = document.getElementById('homeScreen');

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// canvas background
ctx.fillStyle = "white";

ctx.fillRect(0 , 0, canvas.height, canvas.width);

// player
ctx.fillStyle = "red";

ctx.fillRect(10, 10, 25, 25);

/* END HOME SCREEN CODE */